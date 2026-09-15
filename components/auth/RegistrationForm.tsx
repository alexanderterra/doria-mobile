import { useTermsUrls } from "@/hooks/terms/useTermsUrls";
import { UserType } from "@/types/auth/registration.types";
import { AntDesign } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { CustomInput } from "./CustomInput";

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  cpf: string;
}

interface RegistrationFormProps {
  userType: UserType;
  formData: RegistrationFormData;
  errors: Partial<RegistrationFormData>;
  showPassword: boolean;
  onFieldChange: (field: keyof RegistrationFormData, value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onGoogleSignUp?: () => void;
  onAppleSignUp?: () => void;
  isLoading?: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  userType,
  formData,
  errors,
  showPassword,
  onFieldChange,
  onTogglePassword,
  onSubmit,
  onGoogleSignUp,
  isLoading = false,
}) => {
  const { urlTermoUso, urlPrivacidade } = useTermsUrls();

  return (
    <View style={{ flex: 1 }}>
      <CustomInput
        label="Nome completo"
        iconName="user"
        placeholder="Ex: João da Silva"
        value={formData.name}
        onChangeText={(value) => onFieldChange("name", value)}
        error={errors.name}
        autoCapitalize="words"
      />

      <CustomInput
        label="E-mail"
        iconName="mail"
        placeholder="seu@email.com"
        value={formData.email}
        onChangeText={(value) => onFieldChange("email", value)}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {userType === "especialista" && (
        <CustomInput
          label="CPF (Apenas números)"
          iconName="file-text"
          placeholder="000.000.000-00"
          value={formData.cpf}
          onChangeText={(value) => onFieldChange("cpf", value)}
          error={errors.cpf}
          keyboardType="numeric"
          maxLength={14}
        />
      )}

      <CustomInput
        label="Senha"
        iconName="lock"
        placeholder="Crie uma senha forte"
        value={formData.password}
        onChangeText={(value) => onFieldChange("password", value)}
        error={errors.password}
        isPassword
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />

      <TouchableOpacity
        style={{
          width: "100%",
          marginTop: 8,
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
        onPress={onSubmit}
        disabled={isLoading}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
          {isLoading ? "Cadastrando..." : "Finalizar Cadastro"}
        </Text>
      </TouchableOpacity>

      {false && (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
            <Text
              style={{
                marginHorizontal: 12,
                color: "#94A3B8",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              ou
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          </View>

          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
              onPress={onGoogleSignUp}
              disabled={isLoading}
            >
              <AntDesign
                name="google"
                size={22}
                color="#EF4444"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{ color: "#0F172A", fontSize: 15, fontWeight: "600" }}
              >
                Google
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text
        style={{
          textAlign: "center",
          color: "#94A3B8",
          fontSize: 12,
          marginTop: 24,
          paddingHorizontal: 16,
          marginBottom: 20,
          lineHeight: 18,
        }}
      >
        Ao se cadastrar, você concorda com nossos{" "}
        <Text
          style={{
            color: "#3B82F6",
            fontWeight: "600",
            textDecorationLine: "underline",
          }}
          onPress={() => Linking.openURL(urlTermoUso)}
        >
          Termos de Uso
        </Text>{" "}
        e{" "}
        <Text
          style={{
            color: "#3B82F6",
            fontWeight: "600",
            textDecorationLine: "underline",
          }}
          onPress={() => Linking.openURL(urlPrivacidade)}
        >
          Política de Privacidade
        </Text>
        .{"\n\n"}
        Precisa de ajuda?{" "}
        <Text
          style={{
            color: "#3B82F6",
            fontWeight: "600",
            textDecorationLine: "underline",
          }}
          onPress={async () => {
            const url = "mailto:contato@falecomadoria.com.br";
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert(
                  "Aviso",
                  "Nenhum aplicativo de e-mail encontrado. Por favor, envie sua dúvida para contato@falecomadoria.com.br",
                );
              }
            } catch (error) {
              console.log("Erro ao tentar abrir e-mail:", error);
            }
          }}
        >
          Fale conosco
        </Text>
      </Text>
    </View>
  );
};
