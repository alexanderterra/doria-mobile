import { profileService } from "@/services/profile/profileService";
import {
  EMPTY_DADOS_CLINICA,
  EMPTY_DADOS_PESSOAIS,
  EMPTY_ENDERECO,
  ProfileFormState,
  UserRole,
} from "@/types/profile";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

const ESTADOS_COMPLETOS: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

interface EspecialistaSnapshot {
  profissao: string;
  conselho: string;
  estado_conselho: string;
  num_registro_conselho: string;
  especialidade: string;
  registro_rqe: string;
  curriculo: string;
  termo_aceito: boolean;
  conselho_validado: boolean;
}

interface ClinicaSnapshot {
  nome: string;
  whatsapp: string;
  email: string;
  tipo_atendimento: string;
  tipo_consulta: string;
  site: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  cep: string;
  rua: string;
  numer: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface HorarioSnapshot {
  dia: string;
  ativo: boolean;
  inicio: string;
  fim: string;
}

export function useProfileCompletion() {
  const [role, setRole] = useState<UserRole>("paciente");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formState, setFormState] = useState<ProfileFormState>({
    dadosPessoais: EMPTY_DADOS_PESSOAIS,
    enderecoPessoal: EMPTY_ENDERECO,
    dadosClinica: EMPTY_DADOS_CLINICA,
    enderecoClinica: EMPTY_ENDERECO,
  });

  const snapEspecialista = useRef<EspecialistaSnapshot | null>(null);
  const snapClinica = useRef<ClinicaSnapshot | null>(null);
  const snapHorarios = useRef<HorarioSnapshot[]>([]);
  const snapConvenios = useRef<string[]>([]);

  const idEspecialistaRef = useRef<string | null>(null);
  const idClinicaRef = useRef<string | null>(null);

  const fireToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 2400);
  }, []);

  useFocusEffect(
    useCallback(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await profileService.getFullProfileData();

        if (response.success && response.data?.usuario) {
          const {
            usuario,
            enderecoPessoal,
            especialista,
            clinica,
            convenios,
            horarios,
          } = response.data;

          const rawRole = usuario.tipo_usuario || usuario.tipo;
          const cleanRole = rawRole?.trim().toLowerCase();
          setRole(cleanRole === "especialista" ? "especialista" : "paciente");

          idEspecialistaRef.current = especialista?.id_especialista || null;
          idClinicaRef.current = clinica?.id_clinica || null;

          const formatDataDbParaBr = (d: string) => {
            if (!d) return "";
            const parts = d.split("T")[0].split("-");
            if (parts.length === 3)
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            return "";
          };

          const DIAS = [
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
            "Domingo",
          ];

          const horariosParsed: HorarioSnapshot[] = DIAS.map((dia) => {
            const dbH = horarios?.find((h: any) => h.dia === dia);
            return {
              dia,
              ativo: !!(dbH && dbH.comeco),
              inicio: dbH?.comeco ? dbH.comeco.substring(0, 5) : "08:00",
              fim: dbH?.fim ? dbH.fim.substring(0, 5) : "18:00",
            };
          });

          const horarioFormatado = JSON.stringify(horariosParsed);

          const especialidadesParsed =
            especialista?.especialidade &&
            especialista.especialidade !== "Não informada"
              ? especialista.especialidade.split(",").map((s: string) => ({
                  name: s.trim(),
                  register: especialista.registro_rqe || "",
                }))
              : [];

          const conveniosNomes: string[] =
            convenios?.map((c: any) => c.nome_convenio) || [];

          setFormState({
            dadosPessoais: {
              nome: usuario.nome || "",
              email: usuario.email || "",
              cpf: usuario.cpf || "",
              telefone: usuario.telefone_pessoal || "",
              dataNascimento: formatDataDbParaBr(usuario.data_nascimento),
              sexoBiologico:
                usuario.sexo_biologico === 1
                  ? "Masculino"
                  : usuario.sexo_biologico === 2
                    ? "Feminino"
                    : "",
              areaAtuacao: usuario.area_de_atuacao || "",
            },
            enderecoPessoal: {
              cep: enderecoPessoal?.cep || "",
              rua: enderecoPessoal?.rua || "",
              numero: enderecoPessoal?.numero || "",
              complemento: enderecoPessoal?.complemento || "",
              bairro: enderecoPessoal?.bairro || "",
              cidade: enderecoPessoal?.cidade || "",
              estado: enderecoPessoal?.estado || "",
            },
            dadosClinica: {
              nomeClinica: clinica?.nome || "",
              especialidade: especialista?.especialidade || "",
              telefoneClinica: clinica?.whatsapp || "",
              emailClinica: clinica?.email || "",
              siteClinica: clinica?.site || "",
              tipoAtendimento: clinica?.tipo_atendimento || "",
              tipoConsulta: clinica?.tipo_consulta || "",
              instagram: clinica?.instagram || "",
              facebook: clinica?.facebook || "",
              linkedin: clinica?.linkedin || "",
              miniCurriculo: especialista?.curriculo || "",
              termoAceito: especialista?.termo_aceito || false,
              profissao: especialista?.profissao || "",
              conselhoTipo: especialista?.conselho || "",
              conselhoUF: especialista?.estado_conselho || "",
              conselhoNumero: especialista?.num_registro_conselho || "",
              especialidades: especialidadesParsed,
              convenios: conveniosNomes,
              horario: horarioFormatado,
            },
            enderecoClinica: {
              cep: clinica?.cep || "",
              rua: clinica?.rua || "",
              numero: clinica?.numer || clinica?.numero || "",
              complemento: clinica?.complemento || "",
              bairro: clinica?.bairro || "",
              cidade: clinica?.cidade || "",
              estado: clinica?.estado || "",
            },
          });

          snapEspecialista.current = {
            profissao: especialista?.profissao || "",
            conselho: especialista?.conselho || "",
            estado_conselho: especialista?.estado_conselho || "",
            num_registro_conselho: especialista?.num_registro_conselho || "",
            especialidade: especialista?.especialidade || "",
            registro_rqe: especialista?.registro_rqe || "",
            curriculo: especialista?.curriculo || "",
            termo_aceito: especialista?.termo_aceito || false,
            conselho_validado: !!especialista?.conselho_validado,
          };

          snapClinica.current = {
            nome: clinica?.nome || "",
            whatsapp: clinica?.whatsapp || "",
            email: clinica?.email || "",
            tipo_atendimento: clinica?.tipo_atendimento || "",
            tipo_consulta: clinica?.tipo_consulta || "",
            site: clinica?.site || "",
            instagram: clinica?.instagram || "",
            facebook: clinica?.facebook || "",
            linkedin: clinica?.linkedin || "",
            cep: clinica?.cep || "",
            rua: clinica?.rua || "",
            numer: clinica?.numer || clinica?.numero || "",
            complemento: clinica?.complemento || "",
            bairro: clinica?.bairro || "",
            cidade: clinica?.cidade || "",
            estado: clinica?.estado || "",
          };

          snapHorarios.current = horariosParsed;
          snapConvenios.current = conveniosNomes;
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    }, []),
  );

  const updateForm = <K extends keyof ProfileFormState>(
    section: K,
    field: string,
    value: any,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const limparNumeros = (t?: string) => (t ? t.replace(/\D/g, "") : "");

  const formatarDataParaBanco = (dataBR?: string) => {
    if (!dataBR || !dataBR.includes("/")) return dataBR || "";
    const [dia, mes, ano] = dataBR.split("/");
    return `${ano}-${mes}-${dia}`;
  };

  const buscarCep = async (cep: string, tipo: "pessoal" | "clinica") => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) return;
      const section =
        tipo === "pessoal" ? "enderecoPessoal" : "enderecoClinica";
      updateForm(section, "rua", data.logradouro);
      updateForm(section, "bairro", data.bairro);
      updateForm(section, "cidade", data.localidade);
      updateForm(section, "estado", data.uf);
    } catch {}
  };

  const savePersonalData = async () => {
    setIsSaving(true);

    let sexoNum = null;
    if (formState.dadosPessoais.sexoBiologico === "Masculino") sexoNum = 1;
    if (formState.dadosPessoais.sexoBiologico === "Feminino") sexoNum = 2;

    const payload = {
      nome: formState.dadosPessoais.nome,
      cpf: limparNumeros(formState.dadosPessoais.cpf),
      email: formState.dadosPessoais.email,
      data_nascimento: formatarDataParaBanco(
        formState.dadosPessoais.dataNascimento,
      ),
      telefone_pessoal: limparNumeros(formState.dadosPessoais.telefone),
      sexo: sexoNum,
      area_de_atuacao: formState.dadosPessoais.areaAtuacao || "",
    };

    const res = await profileService.updatePersonalInfo(payload);
    setIsSaving(false);

    if (!res.success) {
      Alert.alert("Erro", res.message || "Erro ao salvar dados pessoais.");
      return false;
    }
    fireToast("Dados Pessoais salvos");
    return true;
  };

  const saveAddress = async () => {
    setIsSaving(true);

    const ufSiglaPessoal = formState.enderecoPessoal.estado || "";
    const ufCompletaPessoal =
      ESTADOS_COMPLETOS[ufSiglaPessoal.toUpperCase()] || ufSiglaPessoal;

    const payload = {
      cep: limparNumeros(formState.enderecoPessoal.cep),
      rua: formState.enderecoPessoal.rua,
      cidade: formState.enderecoPessoal.cidade,
      estado: ufCompletaPessoal, 
      bairro: formState.enderecoPessoal.bairro,
      complemento: formState.enderecoPessoal.complemento || "",
      numero: formState.enderecoPessoal.numero,
    };

    const res = await profileService.updateAddress(payload);
    setIsSaving(false);

    if (!res.success) {
      Alert.alert("Erro", res.message || "Erro ao salvar endereço.");
      return false;
    }
    fireToast("Endereço salvo com sucesso!");
    return true;
  };

  const saveProfessionalData = async (): Promise<boolean> => {
    setIsSaving(true);

    try {
      const clinica = formState.dadosClinica as any;
      const especialidadesArray = clinica.especialidades || [];
      const especialidadeNomes = especialidadesArray
        .map((e: any) => e.name)
        .filter(Boolean)
        .join(", ");
      const rqePrincipal =
        especialidadesArray.find((e: any) => e.register)?.register || "";

      const profissaoFinal =
        clinica.profissao === "Outra"
          ? clinica.profissaoCustomizada
          : clinica.profissao;

      const nextEspecialista: EspecialistaSnapshot = {
        profissao: profissaoFinal || "",
        conselho: clinica.conselhoTipo || "",
        estado_conselho: clinica.conselhoUF || "",
        num_registro_conselho: clinica.conselhoNumero || "",
        especialidade: especialidadeNomes || "Não informada",
        registro_rqe: rqePrincipal,
        curriculo: clinica.miniCurriculo || "",
        termo_aceito: clinica.termoAceito || false,
        conselho_validado: snapEspecialista.current?.conselho_validado || false,
      };

      const espRes = await profileService.updateSpecialistDiff(
        snapEspecialista.current ?? ({} as EspecialistaSnapshot),
        nextEspecialista,
      );

      if (!espRes.success) {
        Alert.alert(
          "Erro",
          espRes.message || "Erro ao salvar dados profissionais.",
        );
        setIsSaving(false);
        return false;
      }

      const idEspecialista =
        espRes.data?.idEspecialista || idEspecialistaRef.current || "";

      idEspecialistaRef.current = idEspecialista;

      const ufSiglaClinica = formState.enderecoClinica.estado || "";
      const ufCompletaClinica =
        ESTADOS_COMPLETOS[ufSiglaClinica.toUpperCase()] || ufSiglaClinica;

      const nextClinica: ClinicaSnapshot = {
        nome:
          formState.dadosClinica.nomeClinica || formState.dadosPessoais.nome,
        whatsapp: limparNumeros(formState.dadosClinica.telefoneClinica),
        email:
          formState.dadosClinica.emailClinica || formState.dadosPessoais.email,
        tipo_atendimento:
          formState.dadosClinica.tipoAtendimento || "Presencial",
        tipo_consulta: clinica.tipoConsulta || "Particular",
        site: formState.dadosClinica.siteClinica || "",
        instagram: clinica.instagram || "",
        facebook: clinica.facebook || "",
        linkedin: clinica.linkedin || "",
        cep: limparNumeros(formState.enderecoClinica.cep),
        rua: formState.enderecoClinica.rua,
        numer: formState.enderecoClinica.numero,
        complemento: formState.enderecoClinica.complemento || "",
        bairro: formState.enderecoClinica.bairro,
        cidade: formState.enderecoClinica.cidade,
        estado: ufCompletaClinica,
      };

      const clinicaRes = await profileService.updateClinicaDiff(
        idEspecialista,
        snapClinica.current ?? ({} as ClinicaSnapshot),
        nextClinica,
      );

      if (!clinicaRes.success) {
        Alert.alert("Erro", clinicaRes.message || "Erro ao salvar clínica.");
        setIsSaving(false);
        return false;
      }

      const idClinica =
        clinicaRes.data?.idClinica || idClinicaRef.current || "";
      idClinicaRef.current = idClinica;

      let nextHorarios: HorarioSnapshot[] = [];
      try {
        nextHorarios = JSON.parse(clinica.horario || "[]");
      } catch {
        nextHorarios = [];
      }

      if (idClinica && nextHorarios.length > 0) {
        await profileService.updateHorariosDiff(
          idClinica,
          snapHorarios.current,
          nextHorarios,
        );
      }

      const nextConvenios: string[] = clinica.convenios || [];
      if (idClinica) {
        await profileService.updateConveniosDiff(
          idClinica,
          snapConvenios.current,
          nextConvenios,
        );
      }

      snapEspecialista.current = { ...nextEspecialista };
      snapClinica.current = { ...nextClinica };
      snapHorarios.current = nextHorarios;
      snapConvenios.current = nextConvenios;

      setIsSaving(false);
      fireToast("Dados da Clínica salvos!");

      return true;
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      Alert.alert("Erro", "Problema de conexão.");
      setIsSaving(false);
      return false;
    }
  };

  const councilChangedSinceLoad = (): boolean => {
    if (!snapEspecialista.current) return true;

    const clinica = formState.dadosClinica as any;
    return (
      clinica.conselhoTipo !== snapEspecialista.current.conselho ||
      clinica.conselhoUF !== snapEspecialista.current.estado_conselho ||
      clinica.conselhoNumero !== snapEspecialista.current.num_registro_conselho
    );
  };

  const isCouncilAlreadyValidated = (): boolean => {
    return (
      !!snapEspecialista.current?.conselho_validado &&
      !councilChangedSinceLoad()
    );
  };

  const calcProgress = (values: (string | undefined)[]): number => {
    const filled = values.filter(
      (v) => v && String(v).trim().length > 0,
    ).length;
    return filled / values.length;
  };

  return {
    role,
    formState,
    isLoading,
    isSaving,
    showToast,
    toastMessage,
    updateForm,
    buscarCep,
    calcProgress,
    savePersonalData,
    saveAddress,
    saveProfessionalData,
    isCouncilAlreadyValidated,
    councilChangedSinceLoad,
  };
}
