import { HistoricoMensagem } from "@/types/chat";
import { api } from "../api/api";

export const chatService = {
  async sendMessage(message: string) {
    try {
      const response = await api.post("/send-message-n8n", { message });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Erro ao enviar mensagem pro n8n:", error);
      return { success: false, error: "Falha ao conectar com a DOR.IA" };
    }
  },

  async getHistorico(sessionId: string, numeroMensagens = 10) {
    try {
      const response = await api.get(`/chat/historico/${sessionId}`, {
        params: { numero_mensagens: numeroMensagens },
      });
      const historico: HistoricoMensagem[] = Array.isArray(response.data)
        ? response.data
        : (response.data?.historico ?? []);

      return { success: true, data: historico };
    } catch (error: any) {
      console.error(
        "Erro ao buscar histórico do chat:",
        error.response?.data || error.message,
      );
      return { success: false, error: "Falha ao carregar histórico do chat" };
    }
  },
};