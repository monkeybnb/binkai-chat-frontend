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

export const getStreamMessage = async (params: {
  thread_id: string;
  question: string;
}) => {
  return api.get(`/thread/stream-message`, {
    data: params,
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    responseType: "stream",
  });
};
