import { Partner } from "@/types/partners";
import { api } from "../api/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const partnersService = {
  getPartners: async (): Promise<ApiResponse<Partner[]>> => {
    try {
      const response = await api.get("/parceiros", { params: { limit: 100 } });
      const parceiros: Partner[] = response.data?.parceiros ?? [];

      return {
        success: true,
        data: [...parceiros].sort((a, b) => a.ordem - b.ordem),
      };
    } catch (error: any) {
      console.error(
        "Erro ao buscar parceiros:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Não foi possível carregar os parceiros.",
      };
    }
  },
};
