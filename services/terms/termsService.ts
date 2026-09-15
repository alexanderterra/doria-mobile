import { Term, TermType } from "@/types/terms";
import { api } from "../api/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const termsService = {
  getVigente: async (tipo: TermType): Promise<ApiResponse<Term>> => {
    try {
      const response = await api.get("/termos/vigente", { params: { tipo } });
      return { success: true, data: response.data?.termo };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          message: "Nenhum termo vigente publicado para este tipo.",
        };
      }

      console.error(
        "Erro ao buscar termo vigente:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Não foi possível carregar o termo.",
      };
    }
  },
};
