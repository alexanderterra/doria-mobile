import { ProfileSelection } from "@/components/auth/ProfileSelection";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { AnimatedCard } from "@/components/common/AnimatedCard";
import { GradientBackground } from "@/components/common/GradientBackground";
import { LgpdConsentModal } from "@/components/common/LgpdConsentModal";
import { REGISTRATION_STEPS } from "@/constants/auth/registration.constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRegistrationForm } from "@/hooks/auth/useRegistrationForm";
import { useRegistrationWizard } from "@/hooks/auth/useRegistrationWizard";
import { api } from "@/services/api/api";
import { saveRefreshToken, saveToken, saveUser } from "@/services/api/storage";
import { registrationService } from "@/services/auth/registrationService";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IconeDoriaBranco from "../../assets/images/IconeDoriaBranco.svg";

export default function RegisterScreen() {
  const { updateAuthState } = useAuth();
  const wizard = useRegistrationWizard();
  const form = useRegistrationForm();

  const [isLoading, setIsLoading] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);

  const handlePreRegister = () => {
    if (!form.validateForm(wizard.userType!)) return;
    setShowLgpdModal(true);
  };

  const handleConfirmRegistration = async (dadosAceite: {
    termosUso: boolean;
    politicaPrivacidade: boolean;
  }) => {
    setShowLgpdModal(false);
    setIsLoading(true);

    const payloadLgpd = {
      termos_uso_aceito: dadosAceite.termosUso,
      politica_privacidade_aceita: dadosAceite.politicaPrivacidade,
    };

    try {
      const finalFormData = { ...form.formData, ...payloadLgpd };

      const response = await registrationService.register(
        wizard.userType!,
        finalFormData,
      );

      if (response.success) {
        if (response.needs_email_confirm) {
          setShowEmailModal(true);
        } else {
          try {
            const loginResponse = await api.post("/login", {
              email: form.formData.email,
              password: form.formData.password,
            });

            if (
              loginResponse.data.Status === "success" &&
              loginResponse.data.token
            ) {
              const refreshToken =
                loginResponse.data.refresh_token ||
                loginResponse.data.refreshToken;

              await saveToken(loginResponse.data.token);
              if (refreshToken) await saveRefreshToken(refreshToken);
              if (loginResponse.data.user) {
                await saveUser(loginResponse.data.user);
                if (typeof updateAuthState === "function") {
                  updateAuthState(loginResponse.data.user);
                }
              }
              router.replace("/chat");
            } else {
              router.replace("/(auth)/login");
            }
          } catch (loginError) {
            console.error("Erro no auto-login:", loginError);
            router.replace("/(auth)/login");
          }
        }
      } else {
        Alert.alert("Erro no Cadastro", response.error);
      }
    } catch (error) {
      console.error("Erro inesperado no cadastro:", error);
      Alert.alert("Erro", "Ocorreu um problema inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = REGISTRATION_STEPS[wizard.step];

  return (
    <GradientBackground>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: "35%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={{ position: "absolute", top: 60, left: 24, padding: 8 }}
            onPress={() =>
              wizard.step === 2 ? wizard.goToPreviousStep() : router.back()
            }
          >
            <Feather name="arrow-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ marginTop: 20, alignItems: "center" }}>
            <IconeDoriaBranco
              width={160}
              height={160}
              fill="currentColor"
              color="#FFFFFF"
            />
          </View>
        </View>

        <AnimatedCard height="72%">
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 28,
                paddingBottom: Platform.OS === "ios" ? 120 : 60,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
            >
              <View
                style={{
                  width: 48,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#E2E8F0",
                  alignSelf: "center",
                  marginTop: 14,
                  marginBottom: 24,
                }}
              />

              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: "#0F172A",
                  marginBottom: 4,
                  letterSpacing: -0.5,
                }}
              >
                {currentStep.title}
              </Text>
              <Text
                style={{ fontSize: 15, color: "#64748B", marginBottom: 32 }}
              >
                {wizard.step === 2 && wizard.userType === "especialista"
                  ? "Dados profissionais para validação SBED."
                  : currentStep.subtitle}
              </Text>

              {wizard.step === 1 ? (
                <ProfileSelection
                  selectedType={wizard.userType}
                  onSelectType={wizard.setUserType}
                />
              ) : (
                <RegistrationForm
                  userType={wizard.userType}
                  formData={form.formData}
                  errors={form.errors}
                  showPassword={form.showPassword}
                  onFieldChange={form.updateField}
                  onTogglePassword={() =>
                    form.setShowPassword(!form.showPassword)
                  }
                  onSubmit={handlePreRegister}
                  isLoading={isLoading}
                />
              )}

              {wizard.step === 1 && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    marginTop: 40,
                  }}
                >
                  <TouchableOpacity
                    disabled={!wizard.canGoToNextStep}
                    style={{
                      width: "100%",
                      borderRadius: 16,
                      backgroundColor: wizard.canGoToNextStep
                        ? "#3B82F6"
                        : "#E2E8F0",
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                    onPress={wizard.goToNextStep}
                  >
                    <Text
                      style={{
                        color: wizard.canGoToNextStep ? "#FFF" : "#94A3B8",
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      Continuar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </AnimatedCard>

        <LgpdConsentModal
          visible={showLgpdModal}
          onAccept={handleConfirmRegistration}
        />

        <Modal
          visible={showEmailModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowEmailModal(false);
            router.replace("/(auth)/login");
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 32,
                width: "100%",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#EFF6FF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <Feather name="mail" size={32} color="#3B82F6" />
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#0F172A",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Falta apenas um passo para começar sua jornada na DOR.IA.
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: "#475569",
                  textAlign: "center",
                  marginBottom: 12,
                  lineHeight: 22,
                }}
              >
                Enviamos um e-mail de confirmação para o endereço cadastrado.
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: "#475569",
                  textAlign: "center",
                  marginBottom: 12,
                  lineHeight: 22,
                }}
              >
                Para ativar sua conta, acesse seu e-mail e clique no link de
                confirmação. Caso não encontre a mensagem, verifique também as
                pastas de <Text style={{ fontWeight: "600" }}>Spam</Text>,{" "}
                <Text style={{ fontWeight: "600" }}>Promoções</Text> ou{" "}
                <Text style={{ fontWeight: "600" }}>Lixo Eletrônico</Text>.
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: "#475569",
                  textAlign: "center",
                  marginBottom: 32,
                  lineHeight: 22,
                }}
              >
                Depois disso, basta voltar ao aplicativo e fazer seu login.
                {"\n"}
                <Text style={{ fontWeight: "600", color: "#3B82F6" }}>
                  Estamos prontos para caminhar com você.
                </Text>
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: "#3B82F6",
                  width: "100%",
                  paddingVertical: 16,
                  borderRadius: 16,
                  alignItems: "center",
                }}
                onPress={() => {
                  setShowEmailModal(false);
                  router.replace("/(auth)/login");
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Entendi, ir para o Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}
