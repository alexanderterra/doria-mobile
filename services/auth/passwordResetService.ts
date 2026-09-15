import { api } from "@/services/api/api";

export const passwordResetService = {
  async request(email: string) {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Erro request forgot-password:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Não foi possível solicitar a redefinição de senha.",
      };
    }
  },

  async confirm(accessToken: string, newPassword: string) {
    try {
      const response = await api.post("/auth/reset-password", {
        access_token: accessToken,
        newPassword,
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Erro confirm reset-password:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Não foi possível redefinir sua senha.",
      };
    }
  },
};
