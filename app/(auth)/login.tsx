import { AuthFooter } from "@/components/auth/AuthFooter";
import { CustomInput } from "@/components/auth/CustomInput";
import { LgpdConsentModal } from "@/components/common/LgpdConsentModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api/api";
import { saveRefreshToken, saveToken, saveUser } from "@/services/api/storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import IconeDoriaBranco from "../../assets/images/IconeDoriaBranco.svg";

const isNotFoundError = (error: any): boolean => {
  const status = error?.response?.status;
  const msg: string = (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.Error ||
    ""
  ).toLowerCase();

  if (status === 404) return true;

  if (
    status === 400 &&
    (msg.includes("not found") ||
      msg.includes("não encontrado") ||
      msg.includes("user not found") ||
      msg.includes("account not found") ||
      msg.includes("usuário não encontrado") ||
      msg.includes("conta não encontrada"))
  ) {
    return true;
  }

  return false;
};

const isInvalidCredentialsError = (error: any): boolean => {
  const status = error?.response?.status;
  const msg: string = (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.Error ||
    ""
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    msg.includes("credenciais inválidas") ||
    msg.includes("senha incorreta") ||
    msg.includes("wrong password") ||
    msg.includes("incorrect password") ||
    msg.includes("unauthorized") ||
    msg.includes("não autorizado")
  );
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [versaoTermoPendente, setVersaoTermoPendente] = useState("");

  const [authError, setAuthError] = useState("");
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardFade = useRef(new Animated.Value(0)).current;

  const { updateAuthState } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const clearAuthError = () => {
    if (authError) setAuthError("");
    if (showRegisterSuggestion) setShowRegisterSuggestion(false);
  };

  const handlePostLogin = async (data: any) => {
    const token = data.token || data.access_token;
    const finalRefreshToken = data.refresh_token || data.refreshToken;

    if (!token) {
      setAuthError("Não foi possível iniciar sua sessão. Tente novamente.");
      return;
    }

    await saveToken(token);

    if (finalRefreshToken) {
      await saveRefreshToken(finalRefreshToken);
    }

    if (data.user) {
      await saveUser(data.user);
    }

    if (typeof updateAuthState === "function") {
      updateAuthState(data.user);
    }

    if (data.precisa_aceitar_termos) {
      setVersaoTermoPendente(data.nova_versao || "");
      setShowLgpdModal(true);
      return;
    }

    router.replace("/(app)/chat");
  };

  const handleLogin = async () => {
    const cleanEmail = normalizeEmail(email);

    setAuthError("");
    setShowRegisterSuggestion(false);

    if (!cleanEmail || !password) {
      setAuthError("Preencha o e-mail e a senha para entrar.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setAuthError("Informe um e-mail válido.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.post("/login", {
        email: cleanEmail,
        password,
      });

      await handlePostLogin(response.data);
    } catch (error: any) {
      if (__DEV__) {
        console.log("Erro de login:", {
          status: error?.response?.status,
          data: error?.response?.data,
        });
      }

      if (isInvalidCredentialsError(error)) {
        setAuthError("Senha incorreta. Verifique sua senha e tente novamente.");
        return;
      }

      if (isNotFoundError(error)) {
        setAuthError(
          "Não encontramos uma conta com este e-mail. Verifique o endereço digitado ou crie uma nova conta.",
        );
        setShowRegisterSuggestion(true);
        return;
      }

      setAuthError(
        "Não foi possível entrar agora. Verifique sua conexão e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceitarTermos = async (dadosAceite: {
    termosUso: boolean;
    politicaPrivacidade: boolean;
  }) => {
    try {
      setIsLoading(true);

      await api.post("/aceitar_termos", {
        termos_uso_aceito: dadosAceite.termosUso,
        politica_privacidade_aceita: dadosAceite.politicaPrivacidade,
        versao_termo: versaoTermoPendente,
      });

      setShowLgpdModal(false);
      router.replace("/(app)/chat");
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível confirmar os termos. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#60A5FA", "#3B82F6", "#1D4ED8"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={{ flex: 1 }}>
        <View
          style={{
            height: "42%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ marginTop: -20, alignItems: "center" }}>
            <IconeDoriaBranco width={200} height={200} fill="#FFFFFF" />
          </View>
        </View>

        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "75%",
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 16,
            opacity: cardFade,
            transform: [{ translateY: cardSlide }],
          }}
        >
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
                  marginBottom: 28,
                }}
              />

              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "700",
                  color: "#0F172A",
                  marginBottom: 4,
                  letterSpacing: -0.5,
                }}
              >
                Entrar
              </Text>

              <Text
                style={{ fontSize: 15, color: "#64748B", marginBottom: 28 }}
              >
                Bem-vindo de volta! Entre com seus dados.
              </Text>

              <CustomInput
                label="E-mail"
                iconName="mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearAuthError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Senha"
                iconName="lock"
                placeholder="••••••••"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  clearAuthError();
                }}
                isPassword
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                rightLabel="Esqueceu a senha?"
                onRightLabelPress={() =>
                  router.push({
                    pathname: "/(auth)/forgot-password",
                    params: { email: normalizeEmail(email) },
                  })
                }
              />

              {!!authError && (
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
                    {authError}
                  </Text>

                  {showRegisterSuggestion && (
                    <TouchableOpacity
                      style={{ marginTop: 10 }}
                      onPress={() => router.push("/(auth)/register")}
                    >
                      <Text
                        style={{
                          color: "#3B82F6",
                          fontSize: 13,
                          fontWeight: "700",
                        }}
                      >
                        Criar uma conta
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={{
                  width: "100%",
                  marginTop: 20,
                  borderRadius: 16,
                  backgroundColor: isLoading ? "#94A3B8" : "#3B82F6",
                  paddingVertical: 16,
                  alignItems: "center",
                  elevation: 7,
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 14,
                }}
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}
                  >
                    Entrar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 24,
                  alignSelf: "center",
                  marginTop: 12,
                }}
                onPress={() => router.push("/(auth)/register")}
              >
                <Text style={{ color: "#94A3B8", fontSize: 14 }}>
                  Ainda não tem uma conta?{" "}
                  <Text style={{ color: "#3B82F6", fontWeight: "700" }}>
                    Cadastre-se
                  </Text>
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  alignItems: "center",
                  marginTop: 40,
                  paddingBottom: 16,
                }}
              >
                <AuthFooter />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>

        <LgpdConsentModal
          visible={showLgpdModal}
          onAccept={handleAceitarTermos}
        />
      </View>
    </LinearGradient>
  );
}
