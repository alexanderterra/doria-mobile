import axios from "axios";
import { router } from "expo-router";
import { Platform } from "react-native";
import {
  clearAll,
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CLIENT_PLATFORM: "android" | "ios" | "web" | "desconhecido" =
  Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web"
    ? Platform.OS
    : "desconhecido";

if (__DEV__) {
  console.log("🔵 Conectando em:", API_URL);
  console.log("🔵 Tipo da URL:", typeof API_URL);
  console.log("🔵 URL está definida?", !!API_URL);
}

if (!API_URL) {
  console.error("ERRO: EXPO_PUBLIC_API_URL não está definida!");
}

const PUBLIC_ENDPOINTS = [
  "/login",
  "/register",
  "/cadastro",
  "/forgot-password",
  "/reset-password",
  "/recuperar-senha",
  "/password-reset",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
];

function getRequestUrl(url?: string) {
  return String(url || "");
}

function isPublicEndpoint(url?: string) {
  const requestUrl = getRequestUrl(url);

  return PUBLIC_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Platform": CLIENT_PLATFORM,
  },
});

api.interceptors.request.use(
  async (config) => {
    if (__DEV__) {
      console.log("Requisição sendo enviada:");
      console.log(
        "  - URL:",
        config.baseURL ? config.baseURL + config.url : config.url,
      );
      console.log("  - Método:", config.method);
      console.log("  - Data:", config.data);
    }

    if (isPublicEndpoint(config.url)) {
      if (config.headers) {
        delete (config.headers as any).Authorization;
        delete (config.headers as any).authorization;
      }

      return config;
    }

    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error("Erro no request:", error);
    }
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("✅ Resposta recebida:", response.status);
    }
    return response;
  },
  async (error) => {
    if (__DEV__) {
      console.error("❌ Erro na resposta:", error?.message);
    }

    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (status && __DEV__) {
      console.log("  - Status:", status);
    }

    if (isPublicEndpoint(requestUrl)) {
      return Promise.reject(error);
    }

    if (
      (status === 401 || status === 440) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("Nenhum refresh_token encontrado no armazenamento.");
        }

        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = refreshResponse.data.token;
        const newRefreshToken =
          refreshResponse.data.refresh_token ||
          refreshResponse.data.refreshToken;

        if (!newAccessToken) {
          throw new Error("Refresh não retornou novo access token.");
        }

        await saveToken(newAccessToken);

        if (newRefreshToken) {
          await saveRefreshToken(newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        if (__DEV__) {
          console.warn(
            "Refresh Token inválido ou expirado! Limpando dados e deslogando...",
          );
        }

        await clearAll();

        router.replace("/(auth)/login");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
