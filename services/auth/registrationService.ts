import { UserType } from "@/types/auth/registration.types";
import { api } from "../api/api";

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  cpf?: string;
}

interface LgpdPayload {
  termos_uso_aceito: boolean;
  politica_privacidade_aceita: boolean;
}

interface GoogleAuthData extends LgpdPayload {
  id_token: string;
  nome?: string;
  cpf?: string;
  tipo?: UserType;
}

interface AppleAuthData extends LgpdPayload {
  id_token: string;
  authorization_code: string;
  nonce: string;
  nome?: string;
  cpf?: string;
  tipo?: UserType;
}

interface RegistrationResponse {
  success: boolean;
  needs_email_confirm?: boolean;
  error?: string;
  data?: any;
}

const SENSITIVE_PAYLOAD_KEYS = [
  "password",
  "cpf",
  "id_token",
  "authorization_code",
  "nonce",
];

function maskPayloadForLog(payload: Record<string, any>) {
  const masked = { ...payload };
  for (const key of SENSITIVE_PAYLOAD_KEYS) {
    if (key in masked) masked[key] = "[REDACTED]";
  }
  return masked;
}

export const registrationService = {
  // Cadastro por e-mail/senha
  async register(
    userType: UserType,
    formData: RegistrationData & Partial<LgpdPayload>,
  ): Promise<RegistrationResponse> {
    try {
      const payload: any = {
        nome: formData.name,
        email: formData.email,
        password: formData.password,
        tipo: userType,
        termos_uso_aceito: formData.termos_uso_aceito ?? false,
        politica_privacidade_aceita:
          formData.politica_privacidade_aceita ?? false,
      };

      if (userType === "especialista" && formData.cpf) {
        payload.cpf = formData.cpf;
      }

      if (__DEV__) {
        console.log("[register] payload:", maskPayloadForLog(payload));
      }

      const response = await api.post("/auth/signup", payload);

      if (response.data.status === "created") {
        return {
          success: true,
          needs_email_confirm: response.data.needs_email_confirm,
        };
      }

      return { success: false, error: "Falha ao criar conta." };
    } catch (error: any) {
      console.error("[register] erro:", error.response?.data);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Ocorreu um erro ao tentar criar a conta.";

      return { success: false, error: errorMessage };
    }
  },

  // Cadastro / login com Google
  async registerWithGoogle(
    userType: UserType,
    googleData: GoogleAuthData,
  ): Promise<RegistrationResponse> {
    try {
      const payload: any = {
        id_token: googleData.id_token,
        tipo: userType,
        termos_uso_aceito: googleData.termos_uso_aceito,
        politica_privacidade_aceita: googleData.politica_privacidade_aceita,
      };

      if (googleData.nome) payload.nome = googleData.nome;

      if (userType === "especialista" && googleData.cpf) {
        payload.cpf = googleData.cpf;
      }

      if (__DEV__) {
        console.log(
          "[registerWithGoogle] payload:",
          maskPayloadForLog(payload),
        );
      }

      const response = await api.post("/auth/google", payload);

      const isSuccess =
        response.data?.status === "success" ||
        response.data?.Status === "success";

      if (isSuccess) {
        return { success: true, data: response.data };
      }

      return { success: false, error: "Falha ao autenticar com o Google." };
    } catch (error: any) {
      console.error(
        "[registerWithGoogle] erro:",
        error.response?.data || error.message,
      );

      const status = error.response?.status;
      let errorMessage = "Ocorreu um erro ao tentar conectar com o Google.";
      if (status === 400)
        errorMessage = "Token Google ausente ou conta sem e-mail.";
      if (status === 401) errorMessage = "Token Google inválido ou rejeitado.";
      if (status === 500)
        errorMessage = "Falha interna ao criar perfil via Google.";

      return { success: false, error: errorMessage };
    }
  },

  // Cadastro / login com Apple
  async registerWithApple(
    userType: UserType,
    appleData: AppleAuthData,
  ): Promise<RegistrationResponse> {
    try {
      const payload: any = {
        id_token: appleData.id_token,
        authorization_code: appleData.authorization_code,
        nonce: appleData.nonce,
        tipo: userType,
        termos_uso_aceito: appleData.termos_uso_aceito,
        politica_privacidade_aceita: appleData.politica_privacidade_aceita,
      };

      if (appleData.nome) payload.nome = appleData.nome;

      if (userType === "especialista" && appleData.cpf) {
        payload.cpf = appleData.cpf;
      }

      if (__DEV__) {
        console.log(
          "[registerWithApple] payload:",
          maskPayloadForLog(payload),
        );
      }

      const response = await api.post("/auth/apple", payload);

      const isSuccess =
        response.data?.status === "success" ||
        response.data?.Status === "success";

      if (isSuccess) {
        return { success: true, data: response.data };
      }

      return { success: false, error: "Falha ao autenticar com a Apple." };
    } catch (error: any) {
      console.error(
        "[registerWithApple] erro:",
        error.response?.data || error.message,
      );

      const status = error.response?.status;
      let errorMessage = "Ocorreu um erro ao tentar conectar com a Apple.";
      if (status === 400) errorMessage = "Token Apple ausente ou inválido.";
      if (status === 401) errorMessage = "Token Apple rejeitado pelo servidor.";
      if (status === 500)
        errorMessage = "Falha interna ao criar perfil via Apple.";

      return { success: false, error: errorMessage };
    }
  },
};
