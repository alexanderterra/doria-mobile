import { SupportContact } from "@/types/support";
import { api } from "../api/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const supportService = {
  getContato: async (): Promise<ApiResponse<SupportContact>> => {
    try {
      const response = await api.get("/suporte-contato");
      return { success: true, data: response.data?.suporte_contato };
    } catch (error: any) {
      console.error(
        "Erro ao buscar contato de suporte:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Não foi possível carregar o contato de suporte.",
      };
    }
  },
};
