import { Conselho, Profissao } from "@/types/professions";
import { api } from "../api/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const professionsService = {
  getProfissoes: async (): Promise<ApiResponse<Profissao[]>> => {
    try {
      const response = await api.get("/profissoes", { params: { limit: 100 } });
      const profissoes: Profissao[] = response.data?.profissoes ?? [];

      return {
        success: true,
        data: [...profissoes].sort((a, b) => a.ordem - b.ordem),
      };
    } catch (error: any) {
      console.error(
        "Erro ao buscar profissões:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Não foi possível carregar as profissões.",
      };
    }
  },

  getConselhos: async (): Promise<ApiResponse<Conselho[]>> => {
    try {
      const response = await api.get("/conselhos", { params: { limit: 100 } });
      const conselhos: Conselho[] = response.data?.conselhos ?? [];

      return {
        success: true,
        data: [...conselhos].sort((a, b) => a.ordem - b.ordem),
      };
    } catch (error: any) {
      console.error(
        "Erro ao buscar conselhos:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message || "Não foi possível carregar os conselhos.",
      };
    }
  },
};
