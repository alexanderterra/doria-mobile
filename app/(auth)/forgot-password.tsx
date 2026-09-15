import { CustomInput } from "@/components/auth/CustomInput";
import { AnimatedCard } from "@/components/common/AnimatedCard";
import { GradientBackground } from "@/components/common/GradientBackground";
import { passwordResetService } from "@/services/auth/passwordResetService";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IconeDoriaBranco from "../../assets/images/IconeDoriaBranco.svg";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordScreen() {
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(
    typeof initialEmail === "string" ? initialEmail : "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleRequestReset = async () => {
    const cleanEmail = normalizeEmail(email);

    setFeedbackMessage("");

    if (!cleanEmail) {
      setFeedbackMessage(
        "Informe seu e-mail para receber o link de recuperação.",
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setFeedbackMessage("Informe um e-mail válido.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await passwordResetService.request(cleanEmail);

      if (response.success) {
        Alert.alert(
          "E-mail enviado!",
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha pelo navegador.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
        );
      } else {
        setFeedbackMessage(
          response.error ||
            "Não foi possível solicitar a recuperação de senha. Tente novamente.",
        );
      }
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);

      setFeedbackMessage(
        "Não foi possível solicitar a recuperação de senha. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
            onPress={() => router.back()}
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 28,
                paddingBottom: 32,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
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
                }}
              >
                Recuperar Senha
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: "#64748B",
                  marginBottom: 32,
                  lineHeight: 21,
                }}
              >
                Digite o e-mail cadastrado. Enviaremos um link para você criar
                uma nova senha.
              </Text>

              <CustomInput
                label="E-mail"
                iconName="mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (feedbackMessage) setFeedbackMessage("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {!!feedbackMessage && (
                <View
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderWidth: 1,
                    borderColor: "#FECACA",
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#B91C1C",
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                  >
                    {feedbackMessage}
                  </Text>
                </View>
              )}

              <View
                style={{ flex: 1, justifyContent: "flex-end", marginTop: 40 }}
              >
                <TouchableOpacity
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    backgroundColor: isLoading ? "#94A3B8" : "#3B82F6",
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                  onPress={handleRequestReset}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}
                    >
                      Enviar link
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </AnimatedCard>
      </View>
    </GradientBackground>
  );
}
