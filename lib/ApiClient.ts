import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const errorMessage = "Error fetching data";

const errorCallback = (status: number, dataError: any) => {
  const message = dataError?.message || dataError?.error;

  return { status, error: message || errorMessage };
};

const handlePushToLogin = async () => {
  localStorage.removeItem("access_token");
  // window.location.href = "/";
};

class ApiClient {
  baseURL: string;
  hasToken: boolean;

  constructor(baseURL?: string, hasToken?: boolean) {
    this.baseURL = baseURL || "";
    this.hasToken = hasToken || true;
  }

  getInstance() {
    const api: AxiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    api.interceptors.request.use(
      (config: any) => {
        if (config.headers && this.hasToken) {
          const token = localStorage.getItem("access_token") ?? "";
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data;

        if (data.success === false) {
          const message = data?.message ?? errorMessage;
          return { ...response.data, status: 400, error: message };
        }

        return response.data;
      },
      async (error: AxiosError) => {
        const resError = error.response;
        const dataError: any = resError?.data;

        switch (resError?.status) {
          case 401:
            // handlePushToLogin();
            return errorCallback(401, dataError);
          default:
            return errorCallback(400, dataError);
        }
      }
    );
    return api;
  }
}

export default ApiClient;
