import { Header } from "@/components/common/Header";
import { AboutModal } from "@/components/profile/AboutModal";
import { FaqModal } from "@/components/profile/FaqModal";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { MenuItemData, MenuItemList } from "@/components/profile/MenuItemList";
import { PartnersModal } from "@/components/profile/PartnersModal";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ReportPreviewModal } from "@/components/profile/ReportPreviewModal";
import { ReportTermsModal } from "@/components/profile/ReportTermsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useDiaryExport } from "@/hooks/diary/useDiaryExport";
import { clearAll } from "@/services/api/storage";
import { diaryService } from "@/services/diary/diaryService";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileMenuScreen() {
  const insets = useSafeAreaInsets();

  const { user, role, updateAuthState } = useAuth();
  const { isExporting, exportToPDF } = useDiaryExport();

  const [isFaqVisible, setIsFaqVisible] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isPartnersVisible, setIsPartnersVisible] = useState(false);

  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const currentRole = role || user?.role || "";
  const isEspecialista = currentRole.toLowerCase().trim() === "especialista";

  const handleStartReportFlow = async () => {
    try {
      const response = await diaryService.getHistory();

      if (response.success && response.data && response.data.length > 0) {
        setReportData(response.data);
        setIsTermsVisible(true);
      } else {
        Alert.alert(
          "Aviso",
          "Você ainda não possui registros no diário para gerar um relatório.",
        );
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      Alert.alert("Erro", "Não foi possível buscar seu histórico.");
    }
  };

  const handleAcceptTerms = () => {
    setIsTermsVisible(false);
    setTimeout(() => {
      setIsPreviewVisible(true);
    }, 400);
  };

  const handleExportFinalPDF = () => {
    const nomeDoUsuario =
      user?.nome || user?.name || user?.username || "Paciente";
    exportToPDF(reportData, nomeDoUsuario);
  };

  const menuItems: MenuItemData[] = [
    // só pra paciente
    ...(!isEspecialista
      ? [
          {
            icon: "trending-up" as const,
            label: "Minha Evolução",
            description: "Histórico de avaliações de dor",
            onPress: () => router.push("/evolutions-history"),
          },
          {
            icon: "file-text" as const,
            label: "Relatório Minha Jornada",
            description: "Visualize e baixe seu histórico",
            onPress: handleStartReportFlow,
          },
          {
            icon: "bell" as const,
            label: "Notificações",
            description: "Lembretes e alertas",
            onPress: () => router.push("/notifications"),
          },
        ]
      : []),

    // só pra especialista
    ...(isEspecialista
      ? [
          {
            icon: "award" as const,
            label: "Certificados",
            description: "Gere seus certificados",
            onPress: () => router.push("/certificates"),
          },
        ]
      : []),

    // em comum pros dois (paciente e especialista)
    {
      icon: "settings" as const,
      label: "Configurações da Conta",
      description: "Senha e exclusão de conta",
      onPress: () => router.push("/settings"),
    },
    {
      icon: "help-circle" as const,
      label: "Ajuda e suporte",
      description: "Dúvidas frequentes",
      onPress: () => setIsFaqVisible(true),
    },
    {
      icon: "info" as const,
      label: "Sobre a DOR.IA",
      description: "Conheça nosso propósito",
      onPress: () => setIsAboutVisible(true),
    },
    {
      icon: "users" as const,
      label: "Parceiros",
      description: "Instituições que apoiam o projeto",
      onPress: () => setIsPartnersVisible(true),
    },
  ];

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAll();
            updateAuthState(null);
            router.replace("/");
          } catch (error) {
            console.log("Erro ao sair:", error);
          }
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Header title="Menu" showBackButton={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHero
          name={user?.nome || user?.name || "Usuário"}
          email={user?.email || ""}
          showEditButton={true}
        />

        <MenuItemList items={menuItems} />

        <LogoutButton onPress={handleLogout} />
      </ScrollView>

      <AboutModal
        visible={isAboutVisible}
        onClose={() => setIsAboutVisible(false)}
      />

      <FaqModal
        visible={isFaqVisible}
        userRole={currentRole.toLowerCase() || "paciente"}
        onClose={() => setIsFaqVisible(false)}
      />

      <PartnersModal
        visible={isPartnersVisible}
        onClose={() => setIsPartnersVisible(false)}
      />

      <ReportTermsModal
        visible={isTermsVisible}
        onClose={() => setIsTermsVisible(false)}
        onAccept={handleAcceptTerms}
      />

      <ReportPreviewModal
        visible={isPreviewVisible}
        data={reportData}
        isExporting={isExporting}
        onClose={() => setIsPreviewVisible(false)}
        onExport={handleExportFinalPDF}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 120 },
});
