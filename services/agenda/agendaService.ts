import { api } from "../api/api";
import { getToken } from "../api/storage";

export interface AgendaPayload {
  nome: string; 
  data: string | Date;
  horario: string; 
  notificacao?: string; 
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const AGENDA_ROUTE = "/consultas";

const combineDateAndTime = (dateInput: any, timeInput: string): string => {
  try {
    let dateStr = "";

    if (typeof dateInput === "string") {
      dateStr = dateInput.split("T")[0];
    } else if (dateInput instanceof Date) {
      dateStr = dateInput.toISOString().split("T")[0];
    } else {
      dateStr = new Date().toISOString().split("T")[0];
    }

    let timeStr = timeInput.trim();
    if (timeStr.length === 5) {
      timeStr = `${timeStr}:00`;
    }

    const finalDate = new Date(`${dateStr}T${timeStr}`);
    if (!isNaN(finalDate.getTime())) {
      return finalDate.toISOString();
    }

    throw new Error("Data inválida");
  } catch (error) {
    return new Date().toISOString();
  }
};

export const agendaService = {
  getAgenda: async (): Promise<ApiResponse<any[]>> => {
    try {
      const token = await getToken();
      const response = await api.get(AGENDA_ROUTE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !response.data.consultas) {
        return { success: true, data: [] };
      }

      const formattedData = response.data.consultas.map((item: any) => {
        const dbDate = new Date(item.data_hora);

        const y = dbDate.getFullYear();
        const m = String(dbDate.getMonth() + 1).padStart(2, "0");
        const d = String(dbDate.getDate()).padStart(2, "0");
        const justDate = `${y}-${m}-${d}`;

        const justTime = dbDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: item.id_consulta,
          nome: item.medico,
          data: justDate, 
          horario: justTime,
          notificacao: item.notificacao,
        };
      });

      return { success: true, data: formattedData };
    } catch (error: any) {
      console.error(
        "Erro ao buscar agenda:",
        error.response?.data || error.message,
      );
      return { success: false, data: [] };
    }
  },

  saveAgendaItem: async (payload: AgendaPayload): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      const bodySafe = {
        medico: payload.nome.trim(), 
        data_hora: combineDateAndTime(payload.data, payload.horario), 
        notificacao: payload.notificacao || "false", 
      };

      const response = await api.post(AGENDA_ROUTE, bodySafe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        success: true,
        message: "Consulta agendada!",
        data: response.data?.consulta, 
      };
    } catch (error: any) {
      console.error(
        "Erro ao salvar agenda:",
        error.response?.data || error.message,
      );
      return { success: false, message: "Erro ao agendar consulta." };
    }
  },

  updateAgendaItem: async (
    id: string | number,
    payload: AgendaPayload,
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      const bodySafe = {
        medico: payload.nome.trim(),
        data_hora: combineDateAndTime(payload.data, payload.horario),
        notificacao: payload.notificacao || "false",
      };

      const response = await api.patch(`${AGENDA_ROUTE}/${id}`, bodySafe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        success: true,
        message: "Consulta atualizada!",
        data: response.data?.consulta,
      };
    } catch (error: any) {
      console.error(
        "Erro ao atualizar agenda:",
        error.response?.data || error.message,
      );
      return { success: false, message: "Erro ao atualizar consulta." };
    }
  },

  deleteAgendaItem: async (id: string | number): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();
      await api.delete(`${AGENDA_ROUTE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { success: true, message: "Consulta cancelada." };
    } catch (error: any) {
      console.error(
        "Erro ao deletar agenda:",
        error.response?.data || error.message,
      );
      return { success: false, message: "Erro ao cancelar consulta." };
    }
  },
};
