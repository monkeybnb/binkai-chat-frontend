import {
  Transaction as SolanaTransaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { io, Socket } from "socket.io-client";
import { parseTransaction } from "viem";

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
    chainId: number;
  };
  network: string;
}

interface WalletResponse {
  address?: string;
  signature?: string;
  signedTransaction?: string;
  error?: string;
}

interface SendTransactionData {
  transaction: string;
  network: string;
}

interface SendTransactionResponse {
  tx_hash?: string;
  error?: string;
}

interface WalletConfig {
  evm?: {
    address: string;
    signMessageAsync: (args: { message: string }) => Promise<string>;
    sendTransaction: any;
  };
  solana?: {
    address: string;
    signMessageAsync: (args: { message: string }) => Promise<string>;
    // signTransaction: (args: { transaction: string }) => Promise<string>;
  };
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private walletConfig: WalletConfig | null = null;
  private readonly SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api-dev.bink-chat.xyz";
  private readonly NAMESPACE = "wallet";
  private eventHandlers: { [key: string]: Function[] } = {};

  private constructor() {}

  public updateWalletConfig(config: Partial<WalletConfig>) {
    this.walletConfig = {
      ...this.walletConfig,
      ...config,
    };
    console.log("Wallet config updated:", this.walletConfig);
  }

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
        resolve();
      } else {
        resolve();
      }
    });
  }

  public async connect(
    threadId: string,
    walletConfig: WalletConfig
  ): Promise<void> {
    console.log(`Connecting to socket with thread ID: ${threadId}`);

    // Wait for cleanup to complete before creating new socket
    await this.cleanupSocket();
    this.walletConfig = walletConfig;

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
    this.walletConfig = null;
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

  private checkNetworkAvailability(network: string): boolean {
    if (!this.walletConfig) {
      this.emit("network_unavailable", { network });
      return false;
    }

    if (network === "solana") {
      if (!this.walletConfig.solana?.address) {
        this.emit("network_unavailable", { network });
        return false;
      }
      return true;
    } else {
      if (!this.walletConfig.evm?.address) {
        this.emit("network_unavailable", { network });
        return false;
      }
      return true;
    }
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
          if (!this.walletConfig) {
            throw new Error("Wallet not connected");
          }
          console.log("get_address request:", data);

          let address = "";
          if (data.network === "solana") {
            if (!this.checkNetworkAvailability("solana")) {
              return callback({ error: "Network not available" });
            }
            address = this.walletConfig.solana?.address || "";
          } else {
            if (!this.checkNetworkAvailability(data.network)) {
              return callback({ error: "Network not available" });
            }
            address = this.walletConfig.evm?.address || "";
          }

          callback({ address });
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
          if (!this.walletConfig) {
            throw new Error("Wallet not connected");
          }
          console.log("sign_message request:", data);

          let signature: string | undefined;
          if (data.network === "solana") {
            if (!this.checkNetworkAvailability("solana")) {
              return callback({ error: "Network not available" });
            }
            signature = await this.walletConfig.solana?.signMessageAsync({
              message: data.message,
            });
          } else {
            if (!this.checkNetworkAvailability(data.network)) {
              return callback({ error: "Network not available" });
            }
            signature = await this.walletConfig.evm?.signMessageAsync({
              message: data.message,
            });
          }

          if (!signature) {
            return callback({ error: "Failed to sign message" });
          }

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
          if (!this.walletConfig) {
            throw new Error("Wallet not connected");
          }
          console.log("sign_transaction request:", data);

          if (data.network === "solana") {
            let tx: SolanaTransaction | VersionedTransaction;
            try {
              tx = VersionedTransaction.deserialize(
                Buffer.from(data.transaction as any, "base64") as any
              );
            } catch (e) {
              tx = SolanaTransaction.from(
                Buffer.from(data.transaction as any, "base64")
              );
            }

            const signedTx = await window.solana.signTransaction(tx);

            const signedTransaction = Buffer.from(
              signedTx.serialize()
            ).toString("base64");

            callback({ signedTransaction });
          } else {
            callback({ error: "Not supported" });
          }
        } catch (error) {
          console.error("Error signing transaction:", error);
          callback({
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );

    this.socket.on(
      "send_transaction",
      async (
        data: SendTransactionData,
        callback: (response: SendTransactionResponse) => void
      ) => {
        try {
          if (!this.walletConfig) {
            throw new Error("Wallet not connected");
          }

          console.log("send_transaction request:", data);

          if (data.network === "solana") {
            callback({ error: "Not supported" });
          } else {
            if (!this.checkNetworkAvailability(data.network)) {
              return callback({ error: "Network not available" });
            }
            const tx = parseTransaction(data.transaction as `0x${string}`);
            const signedTx = await this.walletConfig.evm?.sendTransaction({
              to: tx.to as `0x${string}`,
              value: tx.value as bigint,
              data: tx.data as `0x${string}`,
              gas: tx.gas as bigint,
            });

            console.log("signedTx", signedTx);
            callback({ tx_hash: signedTx });
          }
        } catch (error) {
          console.error("Error sending transaction:", error);
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

  private emit(event: string, params?: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach((handler) => handler(params));
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
