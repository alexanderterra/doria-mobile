import {
  Certificate,
  CertificateDocumentType,
  CertificateValidation,
  DynamicCertificateInscricao,
} from "@/types/certificates";
import { api } from "../api/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export const certificatesService = {
  list: async (): Promise<ApiResponse<Certificate[]>> => {
    try {
      const response = await api.get("/certificados", { params: { limit: 100 } });
      const certificados: Certificate[] = response.data?.certificados ?? [];

      return {
        success: true,
        data: [...certificados].sort((a, b) => a.ordem - b.ordem),
      };
    } catch (error: any) {
      console.error(
        "Erro ao buscar certificados:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Não foi possível carregar os certificados.",
      };
    }
  },

  validate: async (
    slug: string,
    documento: string,
    documentoTipo: CertificateDocumentType = "cpf",
  ): Promise<ApiResponse<CertificateValidation>> => {
    try {
      const response = await api.post(`/certificados/${slug}/validar`, {
        documento,
        documento_tipo: documentoTipo,
      });

      return { success: true, data: response.data?.validacao };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          message:
            "Certificado não encontrado. Entre em contato com a equipe da DOR.IA para verificar sua situação.",
        };
      }

      console.error(
        "Erro ao validar certificado:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Ocorreu um problema ao validar. Tente novamente mais tarde.",
      };
    }
  },

  validateDynamic: async (
    cpf: string,
    nomeCertificado: string,
  ): Promise<ApiResponse<DynamicCertificateInscricao | null>> => {
    try {
      const response = await api.post("/valida_certificados_novo", {
        cpf,
        nome_certificado: nomeCertificado,
      });

      return { success: true, data: response.data?.inscrito ?? null };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }

      console.error(
        "Erro ao validar certificado dinâmico:",
        error.response?.data || error.message,
      );
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Ocorreu um problema ao validar. Tente novamente mais tarde.",
      };
    }
  },
};
