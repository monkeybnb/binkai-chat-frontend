import { APIResponse } from "@/interfaces";
import { getProfile } from "@/services";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useChatStore } from "./index";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: any | undefined;
  setProfile: (profile: any) => void;
  login: (params: {
    address: string;
    signMessageAsync: any;
    disconnect: any;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  loginMethod: string;
  setLoginMethod: (method: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      userInfo: undefined,
      profile: undefined,
      loginMethod: "",
      setLoginMethod: (method: string) => set({ loginMethod: method }),
      setProfile: (profile) => set({ profile }),

      fetchProfile: async () => {
        try {
          const { data, error }: APIResponse<any> = await getProfile();
          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            set({ profile: data });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      },

      login: async ({ address, signMessageAsync, disconnect }) => {
        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
          await get().fetchProfile();
          set({ isAuthenticated: true });
          return;
        }

        try {
          set({ isLoading: true });

          const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/nonce?address=${address}`
          );
          if (!data.nonce) {
            throw new Error("No nonce found");
          }

          console.log("Starting sign message ...");

          const message = `Sign this message to login with nonce: ${data.nonce}`;

          let signature: string;

          // if (loginMethod === "solana") {
          //   const signMsg = new TextEncoder().encode(message);
          //   const sg = await signMessageAsync(signMsg);
          //   signature = Buffer.from(sg).toString("base64");
          // } else {
          signature = await signMessageAsync({ message });
          // }

          console.log("Sign success!", signature);
          const loginData = { address, signature };

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            loginData
          );

          const newAccessToken = response.data?.access_token;

          if (newAccessToken) {
            localStorage.setItem("access_token", newAccessToken);
            await get().fetchProfile();
            set({ isAuthenticated: true });
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          toast("Login failed! Please try again.");
          await disconnect();
          await get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({
            isAuthenticated: false,
            profile: undefined,
            loginMethod: "",
          });
          // Reset chat store state
          useChatStore.setState({
            messages: [],
            threads: [],
            currentThreadId: null,
            isLoading: false,
            isLoadingMore: {},
            hasMore: true,
            currentPage: 1,
            messageHasMore: {},
            messageCurrentPage: {},
          });
          localStorage.clear();
        } catch (error) {
          console.error("Error during logout:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        profile: state.profile,
      }),
    }
  )
);
