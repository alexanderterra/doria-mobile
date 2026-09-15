import { BannerSlot } from "@/components/banners/BannerSlot";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";
import { certificatesService } from "@/services/certificates/certificatesService";
import { buildCertificateHtml } from "@/services/certificates/certificateTemplate";
import { Certificate } from "@/types/certificates";
import { Feather } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router, useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface ValidationState {
  isValidating: boolean;
  isValidated: boolean;
  certificateName: string;
  urlTemplate?: string;
  error: string;
}

const EMPTY_VALIDATION: ValidationState = {
  isValidating: false,
  isValidated: false,
  certificateName: "",
  error: "",
};

export default function CertificatesScreen() {
  const { user, role } = useAuth();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [validations, setValidations] = useState<Record<string, ValidationState>>({});
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);

  const userCPF = user?.cpf || "";

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setIsLoadingCertificates(true);
      certificatesService.list().then((result) => {
        if (cancelled) return;
        if (result.success) {
          setCertificates(result.data || []);
        } else {
          setLoadError(result.message || "Não foi possível carregar os certificados.");
        }
        setIsLoadingCertificates(false);
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cpf;
  };

  const maskedCPF = userCPF ? formatCPF(userCPF) : "Não informado";

  const getValidation = (slug: string): ValidationState =>
    validations[slug] ?? EMPTY_VALIDATION;

  const setValidation = (slug: string, patch: Partial<ValidationState>) => {
    setValidations((prev) => ({ ...prev, [slug]: { ...getValidation(slug), ...patch } }));
  };

  const handleValidate = async (certificate: Certificate) => {
    if (!userCPF) {
      setValidation(certificate.slug, { error: "CPF não encontrado na sua conta." });
      return;
    }

    setValidation(certificate.slug, { isValidating: true, error: "" });

    const cpfLimpo = userCPF.replace(/\D/g, "");

    if (certificate.tipo_validacao === "lista_participantes") {
      const result = await certificatesService.validateDynamic(
        cpfLimpo,
        certificate.nome_evento,
      );

      if (!result.success) {
        setValidation(certificate.slug, {
          isValidating: false,
          error: result.message || "Ocorreu um problema ao validar. Tente novamente mais tarde.",
        });
        return;
      }

      if (result.data) {
        setValidation(certificate.slug, {
          isValidating: false,
          isValidated: true,
          certificateName: result.data.nome,
          urlTemplate: result.data.url_template ?? undefined,
        });
      } else {
        setValidation(certificate.slug, {
          isValidating: false,
          error: "Não localizamos sua inscrição com este CPF neste evento.",
        });
      }
      return;
    }

    const result = await certificatesService.validate(certificate.slug, cpfLimpo, "cpf");

    if (!result.success) {
      setValidation(certificate.slug, {
        isValidating: false,
        error: result.message || "Ocorreu um problema ao validar. Tente novamente mais tarde.",
      });
      return;
    }

    if (result.data?.valido) {
      setValidation(certificate.slug, {
        isValidating: false,
        isValidated: true,
        certificateName: user?.nome || user?.name || "",
      });
    } else {
      setValidation(certificate.slug, {
        isValidating: false,
        error: "Não localizamos sua inscrição com este CPF neste evento.",
      });
    }
  };

  const generatePDF = async (certificate: Certificate) => {
    const { certificateName, urlTemplate } = getValidation(certificate.slug);
    if (!certificateName) {
      Alert.alert("Erro", "Nome do certificado não foi carregado.");
      return;
    }

    setGeneratingSlug(certificate.slug);
    try {
      const imageResponse = await fetch(urlTemplate || certificate.imagem_fundo_url);
      const imageBlob = await imageResponse.blob();
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      const htmlContent = buildCertificateHtml(certificateName, certificate, base64Image);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
        width: 842,
        height: 595,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Baixar/Compartilhar Certificado ${certificate.nome_evento}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
      }
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      Alert.alert("Erro", "Não foi possível gerar o PDF do certificado.");
    } finally {
      setGeneratingSlug(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Certificados"
        showBackButton={true}
        onBack={() => router.push("/profile")}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerInfo}>
          <Feather
            name="award"
            size={48}
            color={PRIMARY_BLUE}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.title}>Certificados Oficiais</Text>
          <Text style={styles.description}>
            Valide sua inscrição usando o CPF vinculado à sua conta para emitir os
            certificados dos eventos parceiros da DOR.IA.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>CPF do Especialista Cadastrado</Text>
          <View style={styles.fieldStaticLocked}>
            <Feather name="lock" size={14} color="#94A3B8" />
            <Text style={styles.fieldStaticTextLocked}>{maskedCPF}</Text>
          </View>
          <Text style={styles.helperText}>
            O CPF cadastrado é usado para validar sua inscrição em cada certificado
            abaixo.
          </Text>
        </View>

        {loadError ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : isLoadingCertificates ? (
          <ActivityIndicator color={PRIMARY_BLUE} style={{ marginTop: 12 }} />
        ) : certificates.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum certificado disponível no momento.</Text>
        ) : (
          certificates.map((certificate) => {
            const validation = getValidation(certificate.slug);
            const isGenerating = generatingSlug === certificate.slug;

            return (
              <View key={certificate.id} style={styles.certificateCard}>
                <View style={styles.certificateHeaderRow}>
                  <Text style={styles.certificateTitle}>{certificate.titulo_exibicao}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {certificate.tipo_validacao === "lista_participantes"
                        ? "Lista de participantes"
                        : "Emissão livre"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.certificateDescription}>
                  {certificate.descricao_exibicao}
                </Text>

                {!validation.isValidated && (
                  <TouchableOpacity
                    style={[styles.btnPrimary, validation.isValidating && styles.btnDisabled]}
                    onPress={() => handleValidate(certificate)}
                    disabled={validation.isValidating}
                    activeOpacity={0.85}
                  >
                    {validation.isValidating ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Feather name="shield" size={18} color="#FFF" />
                        <Text style={styles.btnPrimaryText}>Validar Certificado</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {validation.error ? (
                  <View style={styles.errorBox}>
                    <Feather name="alert-circle" size={16} color="#EF4444" />
                    <Text style={styles.errorText}>{validation.error}</Text>
                  </View>
                ) : null}

                {validation.isValidated && (
                  <View style={styles.successArea}>
                    <View style={styles.successBadge}>
                      <Feather name="check-circle" size={20} color="#10B981" />
                      <Text style={styles.successText}>Inscrição localizada!</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => generatePDF(certificate)}
                      disabled={isGenerating}
                      activeOpacity={0.85}
                    >
                      {isGenerating ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <>
                          <Feather name="download-cloud" size={20} color="#FFF" />
                          <Text style={styles.actionButtonText}>
                            Gerar e Baixar Certificado
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        <BannerSlot
          local="certificados_mobile"
          publicoAlvo={role ?? undefined}
          style={styles.banner}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  headerInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: DARK_TEXT, marginBottom: 8 },
  description: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  fieldStaticLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldStaticTextLocked: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  helperText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
  },
  certificateCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    gap: 10,
  },
  certificateHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_TEXT,
    flexShrink: 1,
  },
  badge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: PRIMARY_BLUE,
  },
  certificateDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
    flexShrink: 1,
  },
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  successArea: { width: "100%", alignItems: "center", marginTop: 4, gap: 12 },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  successText: { color: "#065F46", fontWeight: "600" },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  banner: {
    marginTop: 8,
  },
});
