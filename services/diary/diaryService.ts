import { api } from "../api/api";
import { getToken } from "../api/storage";

export interface PainEntryPayload {
  level: number;
  sleepLevel: number;
  anxietyLevel: number;
  note: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const DIARY_ROUTE = "/registro-dor";

const formatDateSafe = (rawDate: any): string => {
  try {
    if (!rawDate) throw new Error();
    const strDate = String(rawDate).split("T")[0];

    let match = strDate.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const tempDate = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      );
      return tempDate
        .toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    }

    match = strDate.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (match) {
      const tempDate = new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1]),
      );
      return tempDate
        .toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    }

    const d = new Date(strDate);
    if (!isNaN(d.getTime())) {
      return d
        .toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    }

    throw new Error();
  } catch {
    const hoje = new Date();
    return hoje
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  }
};

export const diaryService = {
  getHistory: async (): Promise<ApiResponse<any[]>> => {
    try {
      const token = await getToken();
      const response = await api.get(DIARY_ROUTE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !response.data.registros) {
        return { success: true, data: [] };
      }

      const formattedData = response.data.registros.map((item: any) => ({
        id: item.id_registro,
        date: formatDateSafe(item.criado_em),
        level: item.nivel_dor,
        sleepLevel: item.qualidade_sono,
        anxietyLevel: item.nivel_emocional,
        note: item.descricao,
      }));

      return { success: true, data: formattedData.reverse() };
    } catch (error: any) {
      console.error(
        "Erro ao buscar histórico:",
        error.response?.data || error.message,
      );
      return { success: false, data: [] };
    }
  },

  saveEntry: async (payload: PainEntryPayload): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      const bodySafe = {
        descricao:
          payload.note.trim() !== ""
            ? payload.note
            : "Nenhum detalhe adicionado.",
        nivel_dor: payload.level,
        qualidade_sono: payload.sleepLevel,
        nivel_emocional: payload.anxietyLevel,
      };

      const response = await api.post(DIARY_ROUTE, bodySafe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const savedItem = response.data?.registro;

      return {
        success: true,
        message: "Registro salvo!",
        data: {
          id: savedItem?.id_registro,
          date: formatDateSafe(
            savedItem?.criado_em || new Date().toISOString(),
          ),
          level: savedItem?.nivel_dor || payload.level,
          sleepLevel: savedItem?.qualidade_sono || payload.sleepLevel,
          anxietyLevel: savedItem?.nivel_emocional || payload.anxietyLevel,
          note: savedItem?.descricao || payload.note,
        },
      };
    } catch (error: any) {
      console.error(
        "Erro ao salvar diário da dor:",
        error.response?.data || error.message,
      );
      return { success: false, message: "Erro ao salvar o registro." };
    }
  },

  updateEntry: async (
    id: string | number,
    payload: PainEntryPayload,
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      const bodySafe = {
        descricao:
          payload.note.trim() !== ""
            ? payload.note
            : "Nenhum detalhe adicionado.",
        nivel_dor: payload.level,
        qualidade_sono: payload.sleepLevel,
        nivel_emocional: payload.anxietyLevel,
      };

      const response = await api.patch(`${DIARY_ROUTE}/${id}`, bodySafe, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedItem = response.data?.registro;

      return {
        success: true,
        message: "Registro atualizado!",
        data: {
          id: updatedItem?.id_registro || id,
          date: formatDateSafe(
            updatedItem?.criado_em || new Date().toISOString(),
          ),
          level: updatedItem?.nivel_dor || payload.level,
          sleepLevel: updatedItem?.qualidade_sono || payload.sleepLevel,
          anxietyLevel: updatedItem?.nivel_emocional || payload.anxietyLevel,
          note: updatedItem?.descricao || payload.note,
        },
      };
    } catch (error: any) {
      console.error(
        "Erro ao atualizar diário:",
        error.response?.data || error.message,
      );
      return { success: false, message: "Erro ao atualizar registro." };
    }
  },
};
