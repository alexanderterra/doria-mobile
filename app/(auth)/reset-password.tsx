import { CustomInput } from "@/components/auth/CustomInput";
import { AnimatedCard } from "@/components/common/AnimatedCard";
import { GradientBackground } from "@/components/common/GradientBackground";
import { passwordResetService } from "@/services/auth/passwordResetService";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

let tokenGlobal = "";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  const url = Linking.useURL();

  useEffect(() => {
    const processUrl = (incomingUrl: string | null) => {
      if (!incomingUrl) return;

      if (incomingUrl.includes("access_token=")) {
        const match = incomingUrl.match(/access_token=([^&]+)/);
        if (match && match[1]) {
          tokenGlobal = match[1];
          setToken(match[1]);
        }
      }
    };

    processUrl(url);

    Linking.getInitialURL().then((initialUrl) => processUrl(initialUrl));

    const subscription = Linking.addEventListener("url", (event) => {
      processUrl(event.url);
    });

    return () => subscription.remove();
  }, [url]);

  const handleResetPassword = async () => {
    const tokenFinalParaUso = token || tokenGlobal;

    if (!tokenFinalParaUso) {
      Alert.alert(
        "Link Expirado",
        "Este link já foi usado ou expirou. Por favor, solicite a redefinição de senha novamente.",
      );
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Aviso", "Sua nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Aviso",
        "As senhas digitadas não são iguais. Verifique e tente novamente.",
      );
      return;
    }

    setIsLoading(true);
    const response = await passwordResetService.confirm(
      tokenFinalParaUso,
      newPassword,
    );
    setIsLoading(false);

    if (response.success) {
      Alert.alert(
        "Sucesso",
        "Senha alterada! Você já pode acessar sua conta com a nova senha.",
        [{ text: "Entrar", onPress: () => router.replace("/(auth)/login") }],
      );
    } else {
      Alert.alert("Erro", response.error);
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
                Nova Senha
              </Text>
              <Text
                style={{ fontSize: 15, color: "#64748B", marginBottom: 32 }}
              >
                Crie uma nova senha de no mínimo 8 caracteres para sua conta.
              </Text>

              <CustomInput
                label="Nova Senha"
                iconName="lock"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <CustomInput
                label="Confirmar Nova Senha"
                iconName="check-circle"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

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
                  onPress={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}
                    >
                      Alterar Senha
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
