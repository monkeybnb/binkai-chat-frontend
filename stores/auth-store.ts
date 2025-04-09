import { APIResponse } from "@/interfaces";
import { getProfile } from "@/services";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useChatStore } from "./index";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: any | undefined;
  setProfile: (profile: any) => void;
  login: (params: { address: string; signMessageAsync: any }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      userInfo: undefined,
      profile: undefined,

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

      login: async ({ address, signMessageAsync }) => {
        const accessToken = localStorage.getItem("access_token");
        console.log(accessToken);

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
          const signature = await signMessageAsync({ message });

          console.log("Sign success!", signature);
          const loginData = { address, signature };

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            loginData
          );

          const newAccessToken = response.data?.access_token;

          console.log("Login success!", newAccessToken);

          if (newAccessToken) {
            console.log("Fetching profile ...");
            localStorage.setItem("access_token", newAccessToken);
            await get().fetchProfile();
            set({ isAuthenticated: true });
          }
        } catch (error) {
          console.error("Authentication failed:", error);
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
            pendingMessage: null,
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
