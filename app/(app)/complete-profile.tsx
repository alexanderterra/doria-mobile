import { BannerSlot } from "@/components/banners/BannerSlot";
import { ProgressBanner } from "@/components/profile/ProgressBanner";
import { SaveToast } from "@/components/profile/SaveToast";
import { StepCard } from "@/components/profile/StepCard";
import { StepDadosPessoais } from "@/components/profile/steps/StepDadosPessoais";
import { StepDadosProfissionais } from "@/components/profile/steps/StepDadosProfissionais";
import { StepEnderecoPessoal } from "@/components/profile/steps/StepEnderecoPessoal";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileCompletion } from "@/hooks/complete-profile/useProfileCompletion";
import { api } from "@/services/api/api";
import { professionsService } from "@/services/professions/professionsService";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const BLUE_BG = "#EFF6FF";
const BLUE_BORDER = "#BFDBFE";
const DARK_TEXT = "#0F172A";
const BG = "#F8FAFC";
const BORDER = "#F1F5F9";

type ViewState =
  "hub" | "dadosPessoais" | "enderecoPessoal" | "dadosProfissionais";

const stepTitles: Record<ViewState, string> = {
  hub: "Completar Perfil",
  dadosPessoais: "Dados Pessoais",
  enderecoPessoal: "Seu Endereço",
  dadosProfissionais: "Dados Profissionais",
};

export const ESTADOS_COMPLETOS: Record<string, string> = {
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

export default function CompleteProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const {
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
    councilChangedSinceLoad,
  } = useProfileCompletion();

  const [currentView, setCurrentView] = useState<ViewState>("hub");
  const [isCertifying, setIsCertifying] = useState(false);

  useEffect(() => {
    if (!isLoading && user && formState.dadosPessoais) {
      if (!formState.dadosPessoais.nome && (user.nome || user.name)) {
        updateForm("dadosPessoais", "nome", user.nome || user.name);
      }
      if (!formState.dadosPessoais.email && user.email) {
        updateForm("dadosPessoais", "email", user.email);
      }
      if (!formState.dadosPessoais.cpf && user.cpf) {
        updateForm("dadosPessoais", "cpf", user.cpf);
      }
    }
  }, [isLoading, user]);

  const pPessoal = calcProgress([
    formState.dadosPessoais.nome,
    formState.dadosPessoais.email,
    formState.dadosPessoais.dataNascimento,
    formState.dadosPessoais.telefone,
    formState.dadosPessoais.cpf,
  ]);
  const pEndPessoal = calcProgress([
    formState.enderecoPessoal.cep,
    formState.enderecoPessoal.rua,
    formState.enderecoPessoal.numero,
    formState.enderecoPessoal.bairro,
    formState.enderecoPessoal.cidade,
    formState.enderecoPessoal.estado,
  ]);

  const pClinica = calcProgress([
    formState.dadosClinica.nomeClinica,
    formState.dadosClinica.especialidade,
    formState.dadosClinica.telefoneClinica,
    formState.dadosClinica.tipoAtendimento,
    formState.enderecoClinica.cep,
    formState.enderecoClinica.rua,
    formState.enderecoClinica.numero,
    formState.enderecoClinica.bairro,
    formState.enderecoClinica.cidade,
    formState.enderecoClinica.estado,
  ]);

  const allSections =
    role === "especialista"
      ? [pPessoal, pEndPessoal, pClinica]
      : [pPessoal, pEndPessoal];

  const handleSaveCurrentStep = async () => {
    let success = false;

    if (currentView === "dadosPessoais") {
      success = await savePersonalData();
    } else if (currentView === "enderecoPessoal") {
      success = await saveAddress();
    } else if (currentView === "dadosProfissionais") {
      if (!formState.dadosClinica.termoAceito) {
        Alert.alert(
          "Aceite Obrigatório",
          "Você precisa declarar que suas informações profissionais são verdadeiras marcando a chave no final da tela.",
        );
        return;
      }

      const tipoConselho =
        formState.dadosClinica.conselhoTipo?.toUpperCase() || "";

      if (tipoConselho === "CRM") {
        const specialties = formState.dadosClinica.especialidades || [];
        const isRqeInvalid = specialties.some(
          (spec: any) => !spec.register || spec.register.trim() === "",
        );

        if (specialties.length > 0 && isRqeInvalid) {
          Alert.alert(
            "RQE Obrigatório",
            "Você adicionou uma especialidade. Por favor, preencha o número do RQE para continuar.",
          );
          return;
        }
      }

      setIsCertifying(true);
      const oConselhoMudou = councilChangedSinceLoad();

      success = await saveProfessionalData();

      if (success) {
        if (!oConselhoMudou) {
          setIsCertifying(false);
          setCurrentView("hub");
          return;
        }

        const conselhosResult = await professionsService.getConselhos();
        const conselhoInfo = conselhosResult.data?.find(
          (c) => c.sigla === tipoConselho,
        );

        if (conselhoInfo?.validacao_automatica) {
          try {
            const endpoint = `/certificar_especialista/${tipoConselho.toLowerCase()}`;

            const ufSigla = formState.dadosClinica.conselhoUF || "";

            const payloadCertificacao = {
              codigo: formState.dadosClinica.conselhoNumero || "",
              uf: ufSigla,
              cidade:
                (formState.dadosClinica as any).conselhoCidade || undefined,
              categoria: formState.dadosClinica.profissao || undefined,
            };

            const verifyRes = await api.post(endpoint, payloadCertificacao);

            if (
              verifyRes.data?.Status === "success" ||
              verifyRes.status === 200
            ) {
              setIsCertifying(false);
              Alert.alert(
                "Certificação Aprovada",
                "Seu registro profissional foi validado com sucesso pelo sistema Consultar.IO!",
                [{ text: "OK", onPress: () => setCurrentView("hub") }],
              );
              return;
            }
          } catch (error: any) {
            setIsCertifying(false);
            const status = error.response?.status;

            if (status === 404 || status === 400) {
              Alert.alert(
                "Validação Falhou",
                "Não encontramos o seu registro no conselho ou o número é inválido. Verifique se o registro e a UF estão corretos.",
              );
            } else if (status === 429) {
              Alert.alert(
                "Aviso",
                "Muitas tentativas de validação. Aguarde 5 minutos e tente novamente.",
              );
            } else {
              Alert.alert(
                "Aviso",
                "Ocorreu uma falha na comunicação com o conselho, mas seus dados base foram salvos.",
              );
            }
            return;
          }
        }
      }
      setIsCertifying(false);
    }

    if (success) {
      setCurrentView("hub");
    }
  };

  const handleBackNavigation = () => {
    if (currentView !== "hub") setCurrentView("hub");
    else router.push("/(app)/profile");
  };

  const renderHub = () => (
    <View style={styles.hubContainer}>
      <ProgressBanner sections={allSections} />

      <Text style={styles.sectionLabel}>ETAPAS</Text>

      <StepCard
        icon="user"
        title="Dados Pessoais"
        subtitle="Nome, CPF, telefone, nascimento"
        progress={pPessoal}
        onPress={() => setCurrentView("dadosPessoais")}
      />
      <StepCard
        icon="map-pin"
        title="Seu Endereço"
        subtitle="CEP, rua, número, bairro, cidade"
        progress={pEndPessoal}
        onPress={() => setCurrentView("enderecoPessoal")}
      />

      {role === "especialista" && (
        <View style={styles.highlightContainer}>
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightBadgeText}>Perfil Público</Text>
          </View>
          <Text style={styles.highlightHelperText}>
            Mantenha seu perfil atualizado para que pacientes possam encontrar você na DOR.IA
          </Text>

          <StepCard
            icon="briefcase"
            title="Dados Profissionais"
            subtitle="Nome, atendimento, horários e endereço completo"
            progress={pClinica}
            onPress={() => setCurrentView("dadosProfissionais")}
          />
        </View>
      )}
    </View>
  );

  const renderActiveStep = () => {
    switch (currentView) {
      case "dadosPessoais":
        return (
          <StepDadosPessoais
            role={role}
            data={formState.dadosPessoais}
            onChange={(f, v) => updateForm("dadosPessoais", f, v)}
            isEmailLocked={true}
            isCpfLocked={false}
          />
        );
      case "enderecoPessoal":
        return (
          <StepEnderecoPessoal
            role={role}
            data={formState.enderecoPessoal}
            onChange={(f, v) => updateForm("enderecoPessoal", f, v)}
            onCepBlur={(cep) => buscarCep(cep, "pessoal")}
          />
        );
      case "dadosProfissionais":
        return (
          <StepDadosProfissionais
            data={formState.dadosClinica}
            addressData={formState.enderecoClinica}
            personalCpf={formState.dadosPessoais.cpf}
            onChange={(f, v) => updateForm("dadosClinica", f, v)}
            onAddressChange={(f, v) => updateForm("enderecoClinica", f, v)}
            onCepBlur={(cep) => buscarCep(cep, "clinica")}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <SaveToast visible={showToast} message={toastMessage} />

      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={handleBackNavigation}
        >
          <Feather name="arrow-left" size={24} color={DARK_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stepTitles[currentView]}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentView === "hub" ? renderHub() : renderActiveStep()}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {currentView !== "hub" ? (
            <TouchableOpacity
              style={styles.saveDraftBtn}
              onPress={handleSaveCurrentStep}
              activeOpacity={0.8}
              disabled={isSaving || isCertifying}
            >
              {isSaving || isCertifying ? (
                <ActivityIndicator color={PRIMARY_BLUE} />
              ) : (
                <>
                  <Feather
                    name="save"
                    size={16}
                    color={PRIMARY_BLUE}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.saveDraftText}>Salvar Etapa</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <BannerSlot
                local="completar_perfil_mobile"
                publicoAlvo={role}
                style={styles.completeProfileBanner}
              />
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => router.push("/(app)/profile")}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Voltar ao Perfil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerBackBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: DARK_TEXT },
  hubContainer: { gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1,
    marginTop: 4,
    marginLeft: 2,
  },

  highlightContainer: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
    position: "relative",
  },
  highlightBadge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  highlightBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  highlightHelperText: {
    fontSize: 13,
    color: "#92400E",
    marginBottom: 10,
    marginTop: 4,
    fontWeight: "600",
    paddingHorizontal: 4,
    lineHeight: 18,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  saveDraftBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BLUE_BG,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BLUE_BORDER,
  },
  saveDraftText: { fontSize: 15, fontWeight: "700", color: PRIMARY_BLUE },
  completeProfileBanner: { marginBottom: 12 },
  submitBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
