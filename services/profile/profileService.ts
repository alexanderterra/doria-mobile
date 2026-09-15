import { api } from "../api/api";
import { getToken } from "../api/storage";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}


const authConfig = async () => {
  const token = await getToken();
  return { headers: { Authorization: `Bearer ${token}` } };
};

function diffObject<T extends Record<string, any>>(
  prev: T,
  next: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(next).filter(
      ([k, v]) => JSON.stringify(v) !== JSON.stringify((prev as any)[k]),
    ),
  ) as Partial<T>;
}


export const profileService = {
  getMe: async (): Promise<ApiResponse<any>> => {
    try {
      const config = await authConfig();
      const response = await api.get("/usuario", config);
      if (response.data?.usuario) {
        return { success: true, data: response.data.usuario };
      }
      return { success: false, message: "Usuário não encontrado." };
    } catch {
      return { success: false, message: "Erro ao buscar perfil." };
    }
  },

  getFullProfileData: async (): Promise<ApiResponse<any>> => {
    try {
      const config = await authConfig();
      const safe = (url: string) =>
        api.get(url, config).catch(() => ({ data: null }));

      const [userRes, endRes, espRes, clinRes, convRes, horRes] =
        await Promise.all([
          safe("/usuario"),
          safe("/enderecos"),
          safe("/especialistas"),
          safe("/clinicas"),
          safe("/convenios"),
          safe("/horario-atendimento"),
        ]);

      return {
        success: true,
        data: {
          usuario: userRes.data?.usuario,
          enderecoPessoal: endRes.data?.enderecos?.[0] || null,
          especialista: espRes.data?.especialistas?.[0] || null,
          clinica: clinRes.data?.clinicas?.[0] || null,
          convenios: convRes.data?.convenios || [],
          horarios:
            horRes.data?.horarios_atendimento ||
            horRes.data?.horario_atendimento ||
            [],
        },
      };
    } catch {
      return { success: false, message: "Erro ao carregar dados do perfil." };
    }
  },


  // PATCH - DADOS PESSOAIS 
  updatePersonalInfo: async (payload: any): Promise<ApiResponse<any>> => {
    try {
      const config = await authConfig();
      const response = await api.patch("/usuario", payload, config);
      return { success: true, data: response.data?.usuario };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.Error || "Erro ao salvar dados pessoais.",
      };
    }
  },

  updateNotifications: async (payload: {
    notif_medicacoes?: boolean;
    notif_jornada?: boolean;
    notif_avaliacao?: boolean;
    notif_consultas?: boolean;
  }): Promise<ApiResponse<any>> => {
    try {
      const config = await authConfig();
      const response = await api.patch("/usuario", payload, config);
      return { success: true, data: response.data?.usuario };
    } catch {
      return { success: false, message: "Erro ao salvar preferências." };
    }
  },

  updateAddress: async (payload: any): Promise<ApiResponse<any>> => {
    try {
      const config = await authConfig();
      const getRes = await api.get("/enderecos", config);
      const list = getRes.data?.enderecos || [];

      if (list.length > 0) {
        await api.patch(`/enderecos/${list[0].id_enderecos}`, payload, config);
      } else {
        await api.post("/enderecos", payload, config);
      }
      return { success: true, message: "Endereço salvo com sucesso!" };
    } catch (error: any) {
      return { success: false, message: "Erro ao salvar endereço." };
    }
  },

  // ESCRITA ESPECIALISTA (SOMENTE CAMPOS ALTERADOS)
  updateSpecialistDiff: async (
    prevData: Record<string, any>,
    nextData: Record<string, any>,
  ): Promise<
    ApiResponse<{ idEspecialista: string; councilChanged: boolean }>
  > => {
    try {
      const config = await authConfig();

      const getEsp = await api.get("/especialistas", config);
      const espList = getEsp.data?.especialistas || [];
      if (espList.length === 0) {
        return { success: false, message: "Especialista não encontrado." };
      }

      const idEspecialista: string = espList[0].id_especialista;
      const jaValidado: boolean = !!espList[0].conselho_validado;

      const councilFields = [
        "conselho",
        "estado_conselho",
        "num_registro_conselho",
      ] as const;

      const councilChanged = councilFields.some(
        (f) => nextData[f] !== prevData[f],
      );

      const changed = diffObject(prevData, nextData);

      if (Object.keys(changed).length === 0) {
        console.log("[ESPECIALISTA] Sem alterações, PATCH ignorado.");
        return {
          success: true,
          data: { idEspecialista, councilChanged: false },
        };
      }

      console.log(
        "[ESPECIALISTA] Enviando apenas campos alterados:",
        JSON.stringify(changed, null, 2),
      );

      await api.patch(`/especialistas/${idEspecialista}`, changed, config);

      return { success: true, data: { idEspecialista, councilChanged } };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.Error || "Erro ao atualizar especialista.",
      };
    }
  },


  // CLINICA - somente com campos alterados
  updateClinicaDiff: async (
    idEspecialista: string,
    prevData: Record<string, any>,
    nextData: Record<string, any>,
  ): Promise<ApiResponse<{ idClinica: string }>> => {
    try {
      const config = await authConfig();

      const getClinica = await api.get("/clinicas", config);
      const clinicaList = getClinica.data?.clinicas || [];

      const changed = diffObject(prevData, nextData);

      if (clinicaList.length > 0) {
        const idClinica: string = clinicaList[0].id_clinica;

        if (Object.keys(changed).length === 0) {
          console.log("[CLÍNICA] Sem alterações, PATCH ignorado.");
          return { success: true, data: { idClinica } };
        }

        console.log(
          "[CLÍNICA] Enviando apenas campos alterados:",
          JSON.stringify(changed, null, 2),
        );

        await api.patch(`/clinicas/${idClinica}`, changed, config);
        return { success: true, data: { idClinica } };
      } else {
        // se primeira vez -> post de tudo 
        const createRes = await api.post(
          "/clinicas",
          { ...nextData, id_especialista: idEspecialista },
          config,
        );
        const idClinica =
          createRes.data?.clinica?.id_clinica || createRes.data?.id_clinica;
        return { success: true, data: { idClinica } };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.Error || "Erro ao atualizar clínica.",
      };
    }
  },

  // HORÁRIOS - somente os dias alterados 
  updateHorariosDiff: async (
    idClinica: string,
    prevHorarios: any[],
    nextHorarios: any[],
  ): Promise<ApiResponse<void>> => {
    try {
      const config = await authConfig();

      const getHor = await api.get("/horario-atendimento", config);
      const savedHorarios: any[] =
        getHor.data?.horarios_atendimento ||
        getHor.data?.horario_atendimento ||
        [];

      const savedByDay = Object.fromEntries(
        savedHorarios.map((h: any) => [h.dia, h]),
      );

      for (const next of nextHorarios) {
        const prev = prevHorarios.find((h) => h.dia === next.dia);

        const ativoChanged = prev?.ativo !== next.ativo;
        const inicioChanged = next.ativo && prev?.inicio !== next.inicio;
        const fimChanged = next.ativo && prev?.fim !== next.fim;

        if (!ativoChanged && !inicioChanged && !fimChanged) {
          console.log(`[HORÁRIO] ${next.dia}: sem alteração, ignorado.`);
          continue;
        }

        const body = {
          id_clinica: idClinica,
          dia: next.dia,
          comeco: next.ativo ? next.inicio : null,
          fim: next.ativo ? next.fim : null,
        };

        const savedEntry = savedByDay[next.dia];

        if (savedEntry?.id_horario_atendimento) {
          console.log(`[HORÁRIO] ${next.dia}: PATCH`);
          await api
            .patch(
              `/horario-atendimento/${savedEntry.id_horario_atendimento}`,
              body,
              config,
            )
            .catch((e) =>
              console.log(`Erro PATCH horário ${next.dia}:`, e.message),
            );
        } else {
          console.log(`[HORÁRIO] ${next.dia}: POST`);
          await api
            .post("/horario-atendimento", body, config)
            .catch((e) =>
              console.log(`Erro POST horário ${next.dia}:`, e.message),
            );
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, message: "Erro ao atualizar horários." };
    }
  },


  // CONVÊNIOS 
  updateConveniosDiff: async (
    idClinica: string,
    prevConvenios: string[],
    nextConvenios: string[],
  ): Promise<ApiResponse<void>> => {
    const prevSet = new Set(prevConvenios);
    const nextSet = new Set(nextConvenios);

    const changed =
      prevConvenios.length !== nextConvenios.length ||
      nextConvenios.some((c) => !prevSet.has(c)) ||
      prevConvenios.some((c) => !nextSet.has(c));

    if (!changed) {
      console.log("[CONVÊNIOS] Sem alterações, ignorado.");
      return { success: true };
    }

    try {
      const config = await authConfig();
      const lista = nextConvenios
        .filter((n) => n.trim() !== "")
        .map((nome) => ({ nome_convenio: nome, descricao: "Aceito" }));

      if (lista.length > 0) {
        await api.post(
          "/convenios",
          { id_clinica: idClinica, convenios: lista },
          config,
        );
        console.log("[CONVÊNIOS] Atualizado.");
      }
      return { success: true };
    } catch {
      return { success: false, message: "Erro ao salvar convênios." };
    }
  },

  createSpecialist: async (payload: any): Promise<ApiResponse<any>> => {
    console.warn(
      "[DEPRECATED] createSpecialist: use updateSpecialistDiff + updateClinicaDiff + updateHorariosDiff",
    );
    const especialidadesArray = payload.especialidades || [];
    const primeiraEspecialidade = especialidadesArray[0] || {};
    try {
      const config = await authConfig();

      const specialistPayload = {
        profissao: payload.profissao,
        conselho: payload.conselho,
        estado_conselho: payload.estado_conselho,
        num_registro_conselho: payload.num_registro_conselho,
        especialidade: primeiraEspecialidade.name || "Não informada",
        registro_rqe: primeiraEspecialidade.register || null,
        curriculo: payload.curriculo,
        termo_aceito: payload.termo_aceito,
      };

      let idEspecialista = null;
      const getEsp = await api.get("/especialistas", config);
      const espList = getEsp.data?.especialistas || [];

      if (espList.length > 0) {
        idEspecialista = espList[0].id_especialista;
        await api.patch(
          `/especialistas/${idEspecialista}`,
          specialistPayload,
          config,
        );
      } else {
        const createEsp = await api.post(
          "/especialistas",
          specialistPayload,
          config,
        );
        idEspecialista = createEsp.data?.especialista?.id_especialista;
      }

      if (!idEspecialista) throw new Error("Falha ao obter ID do especialista");

      const clinicaPayload = {
        id_especialista: idEspecialista,
        nome: payload.clinica,
        whatsapp: payload.telefone_de_contato,
        email: payload.email_profissional,
        tipo_atendimento: payload.atendimento,
        tipo_consulta: payload.tipo_consulta,
        site: payload.site,
        instagram: payload.instagram,
        facebook: payload.facebook,
        linkedin: payload.linkedin,
        cep: payload.cep,
        rua: payload.rua,
        numer: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado,
      };

      let idClinica = null;
      const getClinica = await api.get("/clinicas", config);
      const clinicaList = getClinica.data?.clinicas || [];

      if (clinicaList.length > 0) {
        idClinica = clinicaList[0].id_clinica;
        await api.patch(`/clinicas/${idClinica}`, clinicaPayload, config);
      } else {
        const createClinica = await api.post(
          "/clinicas",
          clinicaPayload,
          config,
        );
        idClinica =
          createClinica.data?.clinica?.id_clinica ||
          createClinica.data?.id_clinica;
      }

      if (idClinica && payload.convenios?.length > 0) {
        const listaConvenios = payload.convenios
          .filter((nome: string) => nome.trim() !== "")
          .map((nome: string) => ({
            nome_convenio: nome,
            descricao: "Aceito",
          }));

        if (listaConvenios.length > 0) {
          await api
            .post(
              "/convenios",
              { id_clinica: idClinica, convenios: listaConvenios },
              config,
            )
            .catch((e) => console.log("Erro ao salvar convênios:", e.message));
        }
      }

      if (idClinica && payload.horario_atendimento) {
        try {
          const horariosArr = JSON.parse(payload.horario_atendimento);
          for (const horario of horariosArr) {
            await api
              .post(
                "/horario-atendimento",
                {
                  id_clinica: idClinica,
                  dia: horario.dia,
                  comeco: horario.ativo ? horario.inicio : null,
                  fim: horario.ativo ? horario.fim : null,
                },
                config,
              )
              .catch((e) =>
                console.log(`Erro horário ${horario.dia}:`, e.message),
              );
          }
        } catch {
          console.log("Falha ao processar os horários de atendimento");
        }
      }

      return {
        success: true,
        message: "Dados profissionais salvos com sucesso!",
      };
    } catch (error: any) {
      return { success: false, message: "Erro ao salvar dados profissionais." };
    }
  },

  requestPasswordReset: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      if (response.data?.Status === "ok") {
        return { success: true, message: "E-mail enviado com sucesso." };
      }
      return {
        success: false,
        message: "Não foi possível solicitar a recuperação.",
      };
    } catch (error: any) {
      let message = "Erro ao conectar com o servidor.";
      if (error.response?.data?.Error === "Error sending recovery email") {
        message =
          "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente.";
      } else if (error.response?.data?.Error) {
        message = error.response.data.Error;
      }
      return { success: false, message };
    }
  },

  deleteAccount: async (): Promise<ApiResponse> => {
    try {
      const config = await authConfig();
      const response = await api.delete("/usuario", config);
      if (response.status === 200 || response.data?.Status === "deleted") {
        return { success: true, message: "Conta excluída com sucesso." };
      }
      return { success: false, message: "Falha ao excluir a conta." };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.Error || "Erro ao processar exclusão.",
      };
    }
  },

  certifySpecialist: async (payload: {
    tipo: string;
    codigo: string;
    estado: string;
    cidade?: string;
  }): Promise<ApiResponse> => {
    try {
      const config = await authConfig();
      await api.post("/certificar_especialista", payload, config);
      return {
        success: true,
        message: "Profissional certificado com sucesso!",
      };
    } catch (error: any) {
      const status = error.response?.status;
      let errorMsg = error.response?.data?.Error || "Falha na certificação.";
      if (status === 409) errorMsg = "Especialista já está verificado.";
      if (status === 429)
        errorMsg = "Aguarde 5 minutos para tentar validar novamente.";
      if (status === 501)
        errorMsg = "A validação para CRP ainda não está disponível.";
      return { success: false, message: errorMsg };
    }
  },
};
