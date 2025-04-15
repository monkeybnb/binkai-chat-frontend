import ApiClient from "@/lib/ApiClient";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const api = new ApiClient(apiUrl).getInstance();

export const getNonce = async (params: { address: string }) =>
  api.get("/auth/nonce", { params });

export const login = async (params: { address: string; signature: string }) =>
  api.post("/auth/login", params);

export const getProfile = async () => api.get("/user/profile");

export const getThread = async (params: { page: number; take: number }) =>
  api.get("/thread", { params });

export const getThreadMessages = async (params: {
  id: string;
  page: number;
  take: number;
  sort_field?: string;
  sort_type?: string;
}) => api.get(`/thread/${params.id}/messages`, { params });

export const createThread = async (params: { title: string }) =>
  api.post("/thread", params);

export const deleteThread = async (threadId: string) =>
  api.delete(`/thread/${threadId}`);

export const getStreamMessage = async (params: {
  threadId: string;
  message: string;
}) => {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${apiUrl}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok && response.status !== 201) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body;
  } catch (error: unknown) {
    console.error("Error fetching stream message:", error);
    throw error;
  }
};

export const sendChat = async (params: {
  threadId: string;
  message: string;
}) => {
  return api.post("/chat", params, { timeout: 300000 });
};
