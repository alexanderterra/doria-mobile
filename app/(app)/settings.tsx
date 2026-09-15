import { Header } from "@/components/common/Header";
import { useUser } from "@/hooks/profile/useuser";
import { clearAll } from "@/services/api/storage";
import { passwordResetService } from "@/services/auth/passwordResetService";
import { profileService } from "@/services/profile/profileService";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";
const BG = "#F8FAFC";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordReset = () => {
    const email = normalizeEmail(user?.email || "");

    if (!email) {
      Alert.alert("Erro", "E-mail do usuário não encontrado.");
      return;
    }

    Alert.alert(
      "Redefinir Senha",
      `Enviaremos um link de recuperação para o e-mail:\n\n${email}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar Link",
          onPress: async () => {
            setIsResetting(true);

            try {
              const res = await passwordResetService.request(email);

              if (res.success) {
                Alert.alert(
                  "E-mail enviado!",
                  "Verifique sua caixa de entrada. A redefinição de senha será feita pelo navegador.",
                );
              } else {
                const errorMessage = res.error
                  ? typeof res.error === "string"
                    ? res.error
                    : "Erro ao solicitar redefinição"
                  : "Não foi possível enviar o e-mail de recuperação.";

                Alert.alert("Erro", errorMessage);
              }
            } catch (error) {
              console.error("Erro ao solicitar redefinição de senha:", error);
              Alert.alert(
                "Erro",
                "Não foi possível conectar ao servidor. Tente novamente.",
              );
            } finally {
              setIsResetting(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Atenção: Exclusão de Conta",
      "Esta ação é irreversível. Todos os seus dados, históricos e registros serão apagados permanentemente. Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, excluir",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);

            try {
              const res = await profileService.deleteAccount();

              if (res.success) {
                await clearAll();

                Alert.alert(
                  "Conta excluída",
                  "Sua conta foi excluída com sucesso.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.replace("/(auth)/login"),
                    },
                  ],
                );
              } else {
                Alert.alert(
                  "Erro",
                  res.message || "Não foi possível excluir sua conta.",
                );

                setIsDeleting(false);
              }
            } catch (error) {
              console.error("Erro ao excluir conta:", error);

              Alert.alert("Erro", "Erro de conexão ao tentar excluir a conta.");

              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Header
        title="Configurações da Conta"
        showBackButton={true}
        onBack={() => router.push("/(app)/profile")}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Segurança</Text>

        <TouchableOpacity
          style={[
            styles.itemCard,
            (isResetting || isDeleting) && styles.disabledCard,
          ]}
          activeOpacity={0.7}
          onPress={handlePasswordReset}
          disabled={isResetting || isDeleting}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="lock" size={18} color={PRIMARY_BLUE} />
            </View>

            <View style={styles.itemTextContainer}>
              <Text style={styles.itemTitle}>Redefinir Senha</Text>
              <Text style={styles.itemDesc}>
                Receber link de alteração por e-mail
              </Text>
            </View>
          </View>

          {isResetting ? (
            <ActivityIndicator color={PRIMARY_BLUE} size="small" />
          ) : (
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
          Gerenciamento da Conta
        </Text>

        <TouchableOpacity
          style={[
            styles.itemCard,
            styles.dangerCard,
            (isResetting || isDeleting) && styles.disabledCard,
          ]}
          activeOpacity={0.7}
          onPress={handleDeleteAccount}
          disabled={isResetting || isDeleting}
        >
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: "#FEE2E2" }]}>
              <Feather name="trash-2" size={18} color="#EF4444" />
            </View>

            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: "#EF4444" }]}>
                Excluir Conta
              </Text>
              <Text style={[styles.itemDesc, { color: "#F87171" }]}>
                Apagar dados permanentemente
              </Text>
            </View>
          </View>

          {isDeleting ? (
            <ActivityIndicator color="#EF4444" size="small" />
          ) : (
            <Feather name="chevron-right" size={20} color="#FCA5A5" />
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  disabledCard: {
    opacity: 0.6,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 13,
    color: "#64748B",
  },
  dangerCard: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
});
