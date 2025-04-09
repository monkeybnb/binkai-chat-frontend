import { Socket, io } from "socket.io-client";
import { parseEther } from "viem";

interface MessageData {
  thread_id: string;
  message: string;
  timestamp: string;
}

interface WalletAddressData {
  network: string;
}

interface SignMessageData {
  message: string;
  network: string;
}

interface SignTransactionData {
  transaction: {
    to: `0x${string}`;
    value: string;
  };
}

interface WalletResponse {
  address?: string;
  signature?: string;
  signedTransaction?: string;
  error?: string;
}

interface WagmiConfig {
  address: string;
  signMessageAsync: (args: { message: string }) => Promise<string>;
  sendTransaction: any;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private wagmiConfig: WagmiConfig | null = null;
  private readonly SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api-dev.bink-chat.xyz";
  private readonly NAMESPACE = "wallet";
  private eventHandlers: { [key: string]: Function[] } = {};

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private cleanupSocket(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        // Remove all listeners except disconnect
        this.socket.removeAllListeners("get_address");
        this.socket.removeAllListeners("sign_message");
        this.socket.removeAllListeners("sign_transaction");
        this.socket.removeAllListeners("message");
        this.socket.removeAllListeners("connect");
        this.socket.removeAllListeners("connect_error");
        this.socket.removeAllListeners("reconnect_attempt");

        // Add one-time disconnect listener to resolve the promise
        this.socket.once("disconnect", () => {
          console.log("Socket disconnected successfully");
          this.socket = null;
          resolve();
        });

        // Force disconnect
        this.socket.disconnect();
      } else {
        resolve();
      }
    });
  }

  public async connect(
    threadId: string,
    wagmiConfig: WagmiConfig
  ): Promise<void> {
    console.log(`Connecting to socket with thread ID: ${threadId}`);
    console.log("wagmiConfig", wagmiConfig);

    // Wait for cleanup to complete before creating new socket
    await this.cleanupSocket();
    this.wagmiConfig = wagmiConfig;

    this.socket = io(`${this.SOCKET_URL}/${this.NAMESPACE}`, {
      query: {
        thread_id: threadId,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
    });

    this.setupListeners();
  }

  public async disconnect(): Promise<void> {
    await this.cleanupSocket();
    this.wagmiConfig = null;
  }

  public sendMessage(message: string): void {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }

    const messageData: MessageData = {
      thread_id: this.socket.io.opts.query?.thread_id as string,
      message,
      timestamp: new Date().toISOString(),
    };

    this.socket.emit("message", messageData);
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log(`Socket connected with ID: ${this.socket?.id}`);
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log(`Socket reconnecting... Attempt ${attemptNumber}`);
    });

    this.socket.on(
      "get_address",
      async (
        data: WalletAddressData,
        callback: (response: WalletResponse) => void
      ) => {
        try {
          console.log("get_address request:", this.wagmiConfig);
          if (!this.wagmiConfig) {
            throw new Error("Wallet not connected");
          }
          console.log("get_address request:", data);
          callback({ address: this.wagmiConfig.address });
        } catch (error) {
          console.error("Error getting address:", error);
          callback({
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );

    this.socket.on(
      "sign_message",
      async (
        data: SignMessageData,
        callback: (response: WalletResponse) => void
      ) => {
        try {
          if (!this.wagmiConfig) {
            throw new Error("Wallet not connected");
          }
          console.log("sign_message request:", data);
          const signature = await this.wagmiConfig.signMessageAsync({
            message: data.message,
          });
          callback({ signature });
        } catch (error) {
          console.error("Error signing message:", error);
          callback({
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );

    this.socket.on(
      "sign_transaction",
      async (
        data: SignTransactionData,
        callback: (response: WalletResponse) => void
      ) => {
        try {
          if (!this.wagmiConfig) {
            throw new Error("Wallet not connected");
          }
          console.log("sign_transaction request:", data);

          const signedTransaction = await this.wagmiConfig.sendTransaction({
            to: data.transaction.to,
            value: parseEther(data.transaction.value),
          });

          console.log("signedTransaction", signedTransaction);

          callback({ signedTransaction });
        } catch (error) {
          console.error("Error signing transaction:", error);
          callback({
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );

    this.socket.on("message", (data: MessageData) => {
      console.log("Received message:", data);
      // You can implement custom message handling here
    });
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  private emit(event: string) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => handler());
    }
  }

  public on(event: string, handler: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  public off(event: string, handler: Function) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(
        (h) => h !== handler
      );
    }
  }
}

export const socketService = SocketService.getInstance();
