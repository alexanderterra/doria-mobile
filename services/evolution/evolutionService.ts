import { api } from "../api/api";
import { getToken } from "../api/storage";

export interface EvolutionPayload {
  inicio: string;
  localizacao: string;
  duracao: string;
  caracteristica: string;
  fatores: string;
  irradiacao: string;
  padrao_temporal: string;
  sintomas_associados: string;
}

export const evolutionService = {
  // get: lista todas as evoluções 
  getEvolutions: async () => {
    try {
      const token = await getToken();
      const response = await api.get("/evolucao", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, data: response.data?.evolucoes || [] };
    } catch (error: any) {
      console.error("Erro ao buscar evoluções:", error.response?.data || error);
      return { success: false, data: [] };
    }
  },

  // post: salva todas as evoluções 
  saveEvolution: async (payload: EvolutionPayload) => {
    try {
      const token = await getToken();
      const response = await api.post("/evolucao", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        success: true,
        data: response.data?.evolucao,
        message: "Evolução registrada com sucesso!",
      };
    } catch (error: any) {
      console.error("Erro ao salvar evolução:", error.response?.data || error);
      return { success: false, message: "Erro ao salvar a evolução." };
    }
  },
};
