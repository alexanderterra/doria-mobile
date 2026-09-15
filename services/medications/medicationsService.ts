import { api } from "../api/api";
import { getToken } from "../api/storage";

export interface MedicationPayload {
  nome: string;
  frequencia: string;
  continuo: boolean;
  periodo_inicio?: string;
  periodo_fim?: string;
  horarios: string;
  notificacao_alerta?: string;
  inicio?: string | Date;
  fim?: string | Date;
  tipo?: number;
  horario_inicio?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const MEDICATION_ROUTE = "/medicacoes";

function getMedicationId(item: any): string | number | null {
  return (
    item?.id ||
    item?.id_medicacoes ||
    item?.uuid ||
    item?.medicationId ||
    item?.idMedicacao ||
    null
  );
}

const formatToYMD = (dateInput?: any): string | undefined => {
  if (!dateInput) return undefined;

  if (dateInput instanceof Date) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const dateString = String(dateInput).trim();

  if (!dateString) return undefined;

  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return dateString.substring(0, 10);
  }

  if (dateString.includes("/")) {
    const parts = dateString.split(" ")[0].split("/");

    if (parts.length === 3) {
      const [day, month, year] = parts;

      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }

  const parsedDate = new Date(dateString);

  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return dateString;
};

function normalizeMedication(item: any) {
  const id = getMedicationId(item);

  return {
    ...item,
    id,

    id_medicacoes: item?.id_medicacoes || id,

    nome: item?.nome || item?.medicationName || "",

    frequencia: item?.frequencia || item?.frequency || "",

    continuo:
      item?.continuo === true ||
      item?.continuo === "true" ||
      item?.isContinuous === true ||
      item?.is_continuous === true ||
      item?.uso_continuo === true ||
      item?.uso_continuo === "true",

    periodo_inicio:
      item?.periodo_inicio ||
      item?.data_inicio ||
      item?.inicio ||
      item?.startDate ||
      null,

    periodo_fim:
      item?.periodo_fim || item?.data_fim || item?.fim || item?.endDate || null,

    inicio:
      item?.periodo_inicio ||
      item?.data_inicio ||
      item?.inicio ||
      item?.startDate ||
      null,

    fim:
      item?.periodo_fim || item?.data_fim || item?.fim || item?.endDate || null,

    horarios: item?.horarios || "",

    notificacao_alerta:
      item?.notificacao_alerta === false || item?.notificacao_alerta === "false"
        ? "false"
        : "true",

    horario_inicio:
      item?.horario_inicio ||
      String(item?.horarios || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)[0] ||
      "08:00",
  };
}

export const medicationsService = {
  getMedications: async (): Promise<ApiResponse<any[]>> => {
    try {
      const token = await getToken();

      const response = await api.get(MEDICATION_ROUTE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawMedications =
        response.data?.medicacoes || response.data?.data || response.data || [];

      if (!Array.isArray(rawMedications)) {
        return { success: true, data: [] };
      }

      const formattedData = rawMedications.map(normalizeMedication);

      return { success: true, data: formattedData };
    } catch (error: any) {
      console.error(
        "Erro ao buscar medicações:",
        error.response?.data || error,
      );

      return { success: false, data: [] };
    }
  },

  saveMedication: async (
    payload: MedicationPayload,
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      const rawInicio = payload.periodo_inicio || payload.inicio;
      const rawFim = payload.periodo_fim || payload.fim;

      const isContinuo =
        payload.continuo !== undefined ? payload.continuo : payload.tipo === 1;

      const safePayload: any = {
        nome: payload.nome,
        frequencia: payload.frequencia,
        horarios: payload.horarios,
        notificacao_alerta: payload.notificacao_alerta ?? "true",
        continuo: isContinuo,
        periodo_inicio: formatToYMD(rawInicio),
        periodo_fim: isContinuo ? null : formatToYMD(rawFim),
        horario_inicio: payload.horario_inicio,
      };

      const response = await api.post(MEDICATION_ROUTE, safePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawMedication =
        response.data?.medicacao ||
        response.data?.data ||
        response.data ||
        null;

      const normalizedMedication = rawMedication
        ? normalizeMedication(rawMedication)
        : null;

      return {
        success: true,
        data: normalizedMedication,
        message: "Medicação cadastrada com sucesso!",
      };
    } catch (error: any) {
      console.error("Erro ao salvar medicação:", error.response?.data || error);

      return { success: false, message: "Erro ao salvar a medicação." };
    }
  },

  updateMedication: async (
    id: string | number,
    payload: Partial<MedicationPayload>,
  ): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      const rawInicio = payload.periodo_inicio || payload.inicio;
      const rawFim = payload.periodo_fim || payload.fim;

      const safePayload: any = { ...payload };

      delete safePayload.inicio;
      delete safePayload.fim;
      delete safePayload.tipo;

      if (rawInicio) safePayload.periodo_inicio = formatToYMD(rawInicio);

      if (payload.continuo === true) {
        safePayload.periodo_fim = null;
      } else if (rawFim) {
        safePayload.periodo_fim = formatToYMD(rawFim);
      }

      const response = await api.patch(
        `${MEDICATION_ROUTE}/${id}`,
        safePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const rawMedication =
        response.data?.medicacao ||
        response.data?.data ||
        response.data ||
        null;

      const normalizedMedication = rawMedication
        ? normalizeMedication(rawMedication)
        : null;

      return {
        success: true,
        data: normalizedMedication,
      };
    } catch (error: any) {
      console.error(
        "Erro ao atualizar medicação:",
        error.response?.data || error,
      );

      return { success: false, message: "Erro ao atualizar." };
    }
  },

  deleteMedication: async (id: string | number): Promise<ApiResponse<any>> => {
    try {
      const token = await getToken();

      await api.delete(`${MEDICATION_ROUTE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, message: "Removido com sucesso!" };
    } catch (error: any) {
      console.error(
        "Erro ao deletar medicação:",
        error.response?.data || error,
      );

      return { success: false, message: "Não foi possível excluir." };
    }
  },
};
