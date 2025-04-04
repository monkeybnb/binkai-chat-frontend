import {
  createThread,
  getStreamMessage,
  getThread,
  getThreadMessages,
} from "@/services";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
  threadId: string;
  isLoading?: boolean;
  error?: string;
  attachments?: Array<{
    type: string;
    url: string;
    id?: string;
  }>;
}

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  messages: Message[];
}

interface ChatState {
  threads: Thread[];
  currentThreadId: string | null;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  messageHasMore: Record<string, boolean>;
  messageCurrentPage: Record<string, number>;
  setLoading: (loading: boolean) => void;
  fetchThreads: (page?: number) => Promise<void>;
  fetchMoreThreads: () => Promise<void>;
  fetchThreadMessages: (params: {
    threadId: string;
    page?: number;
  }) => Promise<void>;
  fetchMoreMessages: (threadId: string) => Promise<void>;
  setCurrentThread: (threadId: string) => void;
  addThread: (thread: Omit<Thread, "messages">) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  deleteThread: (threadId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  clearThreadMessages: (threadId: string) => void;
  setThreads: (threads: Thread[]) => void;
  sendMessage: (params: {
    message: string;
    threadId: string | null;
    setStatus: (status: "IDLE" | "GENERATING") => void;
    setMessage: (message: string) => void;
  }) => Promise<string | null>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      isLoading: false,
      hasMore: true,
      currentPage: 1,
      messageHasMore: {},
      messageCurrentPage: {},

      setLoading: (loading) => set({ isLoading: loading }),

      fetchThreads: async (page = 1) => {
        try {
          set({ isLoading: true });
          const response = await getThread({ page, take: 10 });
          if (page === 1) {
            set({
              threads: response.data,
              currentPage: 1,
              hasMore: response.data.length === 10,
            });
          } else {
            set((state) => ({
              threads: [...state.threads, ...response.data],
              hasMore: response.data.length === 10,
            }));
          }
        } catch (error) {
          console.error("Error fetching threads:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoreThreads: async () => {
        const state = get();
        if (!state.hasMore || state.isLoading) return;

        const nextPage = state.currentPage + 1;
        await state.fetchThreads(nextPage);
        set({ currentPage: nextPage });
      },

      fetchThreadMessages: async ({ threadId, page = 1 }) => {
        if (!threadId) return;

        try {
          set({ isLoading: true });
          const response = await getThreadMessages({
            id: threadId,
            page,
            take: 10,
          });

          set((state) => {
            const thread = state.threads.find((t) => t.id === threadId);
            const messages = response.data;

            return {
              threads: state.threads.map((t) =>
                t.id === threadId
                  ? {
                      ...t,
                      messages:
                        page === 1
                          ? messages
                          : [...messages, ...(thread?.messages || [])],
                    }
                  : t
              ),
              messageHasMore: {
                ...state.messageHasMore,
                [threadId]: messages.length === 10,
              },
              messageCurrentPage: {
                ...state.messageCurrentPage,
                [threadId]: page,
              },
            };
          });
        } catch (error) {
          console.error("Error fetching thread messages:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMoreMessages: async (threadId) => {
        const state = get();
        if (!state.messageHasMore[threadId] || state.isLoading) return;

        const currentPage = state.messageCurrentPage[threadId] || 1;
        const nextPage = currentPage + 1;
        await state.fetchThreadMessages({
          threadId,
          page: nextPage,
        });
      },

      setThreads: (threads) => set({ threads }),
      setCurrentThread: (threadId) => set({ currentThreadId: threadId }),
      addThread: (thread) =>
        set((state) => ({
          threads: [
            {
              ...thread,
              messages: [],
            },
            ...state.threads,
          ],
          currentThreadId: thread.id,
        })),

      updateThread: (threadId, updates) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? { ...thread, ...updates, updatedAt: new Date().toISOString() }
              : thread
          ),
        })),

      deleteThread: (threadId) =>
        set((state) => ({
          threads: state.threads.filter((thread) => thread.id !== threadId),
          currentThreadId:
            state.currentThreadId === threadId ? null : state.currentThreadId,
        })),

      addMessage: (message) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === message.threadId
              ? {
                  ...thread,
                  messages: [...(thread?.messages || []), message],
                  updated_at: new Date().toISOString(),
                }
              : thread
          ),
        })),

      updateMessage: (messageId, updates) =>
        set((state) => ({
          threads: state.threads.map((thread) => ({
            ...thread,
            messages: thread.messages.map((message) =>
              message.id === messageId ? { ...message, ...updates } : message
            ),
            updated_at: thread.messages.some((m) => m.id === messageId)
              ? new Date().toISOString()
              : thread.updated_at,
          })),
        })),

      deleteMessage: (messageId) =>
        set((state) => ({
          threads: state.threads.map((thread) => ({
            ...thread,
            messages: thread.messages.filter(
              (message) => message.id !== messageId
            ),
            updated_at: thread.messages.some((m) => m.id === messageId)
              ? new Date().toISOString()
              : thread.updated_at,
          })),
        })),

      clearThreadMessages: (threadId) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [],
                  updatedAt: new Date().toISOString(),
                }
              : thread
          ),
        })),

      sendMessage: async ({ message, threadId, setStatus, setMessage }) => {
        if (!message.trim()) return null;

        let currentThreadId = threadId;
        try {
          setStatus("GENERATING");

          if (!currentThreadId) {
            const newThread: any = await createThread({
              title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
            });

            const thread: Thread = {
              id: newThread.id,
              title: newThread.title,
              created_at: newThread.created_at,
              updated_at: newThread.updated_at,
              user_id: newThread.user_id,
              messages: [],
            };

            get().addThread(thread);
            currentThreadId = newThread.id;
          }

          const userMessage: Message = {
            id: Date.now().toString(),
            content: message,
            role: "user",
            createdAt: new Date().toISOString(),
            threadId: currentThreadId as string,
          };
          get().addMessage(userMessage);
          setMessage("");

          const response: any = await getStreamMessage({
            thread_id: currentThreadId as string,
            question: message,
          });

          if (response.includes("error")) {
            get().addMessage({
              id: (Date.now() + 1).toString(),
              content: "",
              role: "assistant",
              createdAt: new Date().toISOString(),
              threadId: currentThreadId as string,
              error:
                "An error occurred while generating the response. Please try again.",
            });
            return currentThreadId;
          }

          const reader = response.data.getReader();
          const decoder = new TextDecoder();
          let content = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            content += chunk;
          }

          get().addMessage({
            id: (Date.now() + 1).toString(),
            content,
            role: "assistant",
            createdAt: new Date().toISOString(),
            threadId: currentThreadId as string,
          });

          return currentThreadId;
        } catch (error) {
          console.error("Error sending message:", error);
          if (currentThreadId) {
            get().addMessage({
              id: (Date.now() + 1).toString(),
              content: "",
              role: "assistant",
              createdAt: new Date().toISOString(),
              threadId: currentThreadId as string,
              error: "Failed to send message. Please try again.",
            });
          }
          return null;
        } finally {
          setStatus("IDLE");
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        threads: state.threads,
      }),
    }
  )
);

export const useThreads = () => {
  const { threads, isLoading, hasMore, fetchThreads, fetchMoreThreads } =
    useChatStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && threads.length === 0) {
      fetchThreads(1);
    }
  }, [isAuthenticated, fetchThreads, threads.length]);

  return { threads, isLoading, hasMore, fetchMoreThreads };
};

export const useCurrentThread = () => {
  const params = useParams();
  const { threads } = useChatStore();
  const threadId = params?.threadId as string;
  return threads.find((thread) => thread.id === threadId);
};

export const useThreadMessages = (threadId: string) => {
  const {
    threads,
    isLoading,
    messageHasMore,
    fetchThreadMessages,
    fetchMoreMessages,
  } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const thread = threads.find((t) => t.id === threadId);

  useEffect(() => {
    console.log(threadId, isAuthenticated);

    if (threadId && isAuthenticated) {
      fetchThreadMessages({ threadId, page: 1 });
    }
  }, [threadId, isAuthenticated, fetchThreadMessages]);

  return {
    messages: thread?.messages || [],
    isLoading,
    hasMore: messageHasMore[threadId] || false,
    fetchMore: () => fetchMoreMessages(threadId),
  };
};

export const useLatestMessage = (threadId: string) => {
  const { messages } = useThreadMessages(threadId);
  return messages[messages.length - 1];
};

export const useThreadRouter = () => {
  const router = useRouter();
  const params = useParams();
  const { setCurrentThread, currentThreadId } = useChatStore();

  useEffect(() => {
    const threadId = params?.threadId as string;
    if (threadId && threadId !== currentThreadId) {
      setCurrentThread(threadId);
    }
  }, [params?.threadId, currentThreadId, setCurrentThread]);

  const navigateToThread = (threadId: string) => {
    router.push(`/chat?threadId=${threadId}`);
  };

  return { navigateToThread };
};
