import {
  createThread,
  deleteThread,
  getStreamMessage,
  getThread,
  getThreadMessages,
} from "@/services";
import { EventSourceParserStream } from "eventsource-parser/stream";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { useAuthStore } from "./auth-store";

type TextStreamUpdate = {
  done: boolean;
  content: string;
  citations?: any;
  error?: any;
};

export interface Message {
  id: string;
  content: string;
  is_ai: boolean;
  created_at: string;
  thread_id: string;
  isLoading?: boolean;
  error?: string;
  parent_id?: string;
  user_id?: string;
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
  messages: Message[];
  threads: Thread[];
  currentThreadId: string | null;
  isLoading: boolean;
  isLoadingMore: Record<string, boolean>;
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
  }) => Promise<string | null>;
  createThread: (message: string) => Promise<string>;
  streamToIterator: (
    reader: ReadableStreamDefaultReader
  ) => AsyncGenerator<TextStreamUpdate>;
  createTextStream: (
    responseBody: ReadableStream<Uint8Array>,
    tempMsgUid: string,
    currentThreadId: string
  ) => Promise<{
    content: string;
    reason?: string;
  }>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
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

  setLoading: (loading) => set({ isLoading: loading }),

  fetchThreads: async (page = 1) => {
    try {
      const response = await getThread({ page, take: 20 });
      if (page === 1) {
        set({
          threads: response.data,
          currentPage: 1,
          hasMore: response.data.length === 20,
        });
      } else {
        set((state) => ({
          threads: [...state.threads, ...response.data],
          hasMore: response.data.length === 20,
        }));
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
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
      if (page === 1) {
        set({ isLoading: true });
      } else {
        set((state) => ({
          isLoadingMore: { ...state.isLoadingMore, [threadId]: true },
        }));
      }
      const response = await getThreadMessages({
        id: threadId,
        page,
        take: 20,
      });

      const messages = response?.data || [];
      const hasMore = messages.length === 20;

      set((state) => {
        const thread = state.threads.find((t) => t.id === threadId);
        const existingMessages = thread?.messages || [];

        // If it's page 1 or no existing messages, just use new messages
        const updatedMessages =
          page === 1 ? messages : [...existingMessages, ...messages];

        return {
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: updatedMessages,
                }
              : t
          ),
          messageHasMore: {
            ...state.messageHasMore,
            [threadId]: hasMore,
          },
          messageCurrentPage: {
            ...state.messageCurrentPage,
            [threadId]: hasMore ? page : state.messageCurrentPage[threadId],
          },
        };
      });
    } catch (error) {
      console.error("Error fetching thread messages:", error);
    } finally {
      if (page === 1) {
        set({ isLoading: false });
      } else {
        set((state) => ({
          isLoadingMore: { ...state.isLoadingMore, [threadId]: false },
        }));
      }
    }
  },

  fetchMoreMessages: async (threadId) => {
    const state = get();
    if (
      !threadId ||
      !state.messageHasMore[threadId] ||
      state.isLoadingMore[threadId]
    )
      return;

    const currentPage = state.messageCurrentPage[threadId] || 1;
    const nextPage = currentPage + 1;

    try {
      set((state) => ({
        isLoadingMore: { ...state.isLoadingMore, [threadId]: true },
      }));

      const response = await getThreadMessages({
        id: threadId,
        page: nextPage,
        take: 20,
      });

      const messages = response?.data || [];
      const hasMore = messages.length === 20;

      if (messages.length === 0) {
        set((state) => ({
          messageHasMore: {
            ...state.messageHasMore,
            [threadId]: false,
          },
          isLoadingMore: { ...state.isLoadingMore, [threadId]: false },
        }));
        return;
      }

      set((state) => {
        const thread = state.threads.find((t) => t.id === threadId);
        const existingMessages = thread?.messages || [];

        return {
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...existingMessages, ...messages],
                }
              : t
          ),
          messageHasMore: {
            ...state.messageHasMore,
            [threadId]: hasMore,
          },
          messageCurrentPage: {
            ...state.messageCurrentPage,
            [threadId]: nextPage,
          },
          isLoadingMore: { ...state.isLoadingMore, [threadId]: false },
        };
      });
    } catch (error) {
      console.error("Error fetching more messages:", error);
      set((state) => ({
        isLoadingMore: { ...state.isLoadingMore, [threadId]: false },
      }));
    }
  },

  setThreads: (threads) => set({ threads }),
  setCurrentThread: (threadId) => set({ currentThreadId: threadId }),
  addThread: (thread) =>
    set((state) => ({
      threads: [{ ...thread, messages: [] }, ...state.threads],
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

  deleteThread: async (threadId: string) => {
    try {
      const { error }: any = await deleteThread(threadId);
      if (error) {
        throw new Error(error);
      }
      set((state) => ({
        threads: state.threads.filter((thread) => thread.id !== threadId),
        currentThreadId:
          state.currentThreadId === threadId ? null : state.currentThreadId,
      }));
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  },

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      threads: state.threads.map((thread) =>
        thread.id === message.thread_id
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
        messages: thread.messages?.map((message) =>
          message.id === messageId ? { ...message, ...updates } : message
        ),
        updated_at: thread.messages?.some((m) => m.id === messageId)
          ? new Date().toISOString()
          : thread.updated_at,
      })),
    })),

  deleteMessage: (messageId) =>
    set((state) => ({
      threads: state.threads.map((thread) => ({
        ...thread,
        messages: thread.messages.filter((message) => message.id !== messageId),
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

  createThread: async (message: string) => {
    try {
      const newThread: any = await createThread({
        title: message
          ? message.slice(0, 50) + (message.length > 50 ? "..." : "")
          : "New Chat",
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
      return thread.id;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    }
  },

  streamToIterator: async function* (
    reader: ReadableStreamDefaultReader
  ): AsyncGenerator<TextStreamUpdate> {
    while (true) {
      const { value, done }: any = await reader.read();

      if (done) {
        yield { done: true, content: "" };
        break;
      }
      if (!value) {
        continue;
      }
      const data = value.data;
      if (data.startsWith("[DONE]")) {
        yield { done: true, content: "" };
        break;
      }

      try {
        const parsedData = JSON.parse(data);

        if (parsedData.error) {
          yield { done: true, content: "", error: parsedData.error };
          break;
        }

        if (parsedData.citations) {
          yield { done: false, content: "", citations: parsedData.citations };
          continue;
        }

        yield {
          done: false,
          content: parsedData.content ?? "",
        };
      } catch (e) {
        console.error("Error extracting delta from SSE event:", e);
        yield { done: true, content: "", error: e };
      }
    }
  },

  createTextStream: async (
    responseBody: ReadableStream<Uint8Array>,
    tempMsgUid: string,
    currentThreadId: string
  ): Promise<{
    content: string;
    reason?: string;
  }> => {
    let content = "";
    let reason = undefined;

    const eventStream = responseBody
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();

    const iterator = get().streamToIterator(eventStream);

    for await (const update of iterator) {
      const { content: chunk, done, error } = update;

      if (error || done) {
        if (!reason) reason = error;
        break;
      }

      if (chunk === "" || chunk === "\n") continue;

      content += chunk;

      get().updateMessage(tempMsgUid, {
        content,
        is_ai: true,
        thread_id: currentThreadId as string,
        isLoading: false,
      });
    }

    return { content, reason };
  },

  sendMessage: async ({ message, threadId }) => {
    if (!message.trim()) return null;
    const tempMsgUid = uuidv4();

    let currentThreadId = threadId;
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        is_ai: false,
        created_at: new Date().toISOString(),
        thread_id: currentThreadId as string,
      };
      get().addMessage(userMessage);

      const tempMessage: Message = {
        id: tempMsgUid,
        content: "",
        is_ai: true,
        created_at: new Date().toISOString(),
        thread_id: currentThreadId as string,
        isLoading: true,
      };

      get().addMessage(tempMessage);

      const response = await getStreamMessage({
        threadId: currentThreadId as string,
        message,
      });

      const { content: textStream, reason } = await get().createTextStream(
        response as any,
        tempMsgUid,
        currentThreadId as string
      );

      if (reason) {
        get().updateMessage(tempMsgUid, {
          isLoading: false,
          is_ai: true,
          error: reason,
        });
      }

      get().updateMessage(tempMsgUid, {
        content: textStream,
        is_ai: true,
        thread_id: currentThreadId as string,
        isLoading: false,
      });

      return currentThreadId;
    } catch (error) {
      console.error("Error sending message:", error);
      if (currentThreadId) {
        get().updateMessage(tempMsgUid, {
          isLoading: false,
          is_ai: true,
          error: "Failed to send message. Please try again.",
        });
      }
      return null;
    }
  },
}));

interface ThreadsHookReturn {
  threads: Thread[];
  isLoading: boolean;
  hasMore: boolean;
  fetchMoreThreads: () => Promise<void>;
}

export const useThreads = (): ThreadsHookReturn => {
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
    isLoadingMore,
    messageHasMore,
    fetchThreadMessages,
    fetchMoreMessages,
  } = useChatStore();
  const thread = threads.find((t) => t.id === threadId);

  useEffect(() => {
    if (threadId) {
      fetchThreadMessages({ threadId, page: 1 });
    }
  }, [threadId, fetchThreadMessages]);

  return {
    messages: thread?.messages || [],
    isLoading,
    isLoadingMore: isLoadingMore[threadId] || false,
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
