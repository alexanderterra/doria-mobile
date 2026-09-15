import {
  FAQ_ESPECIALISTA,
  FAQ_PACIENTE,
  FAQ_SUPORTE,
} from "@/constants/faqData";
import { supportService } from "@/services/support/supportService";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";
const FALLBACK_SUPPORT_EMAIL = "contato@falecomadoria.com.br";

interface FaqModalProps {
  visible: boolean;
  userRole: "paciente" | "especialista";
  onClose: () => void;
}

export function FaqModal({ visible, userRole, onClose }: FaqModalProps) {
  const userFaqs =
    userRole === "especialista" ? FAQ_ESPECIALISTA : FAQ_PACIENTE;

  const [supportEmail, setSupportEmail] = useState(FALLBACK_SUPPORT_EMAIL);

  useEffect(() => {
    const loadSupportContact = async () => {
      const result = await supportService.getContato();
      if (result.success && result.data?.email) {
        setSupportEmail(result.data.email);
      }
    };

    loadSupportContact();
  }, []);

  const handleContactSupport = async () => {
    const url = `mailto:${supportEmail}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Aviso",
          `Nenhum aplicativo de e-mail configurado. Por favor, envie sua dúvida para ${supportEmail}`,
        );
      }
    } catch (error) {
      console.log("Erro ao tentar abrir e-mail:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
          <Text style={styles.modalCancelText}>Fechar</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Ajuda e Suporte</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.faqSectionTitle}>
          {userRole === "especialista"
            ? "🧑‍⚕️ FAQ – Perguntas frequentes"
            : "👤 FAQ – Perguntas frequentes"}
        </Text>

        <TouchableOpacity
          style={styles.supportBanner}
          activeOpacity={0.8}
          onPress={handleContactSupport}
        >
          <View style={styles.supportIconContainer}>
            <Feather name="mail" size={20} color={PRIMARY_BLUE} />
          </View>
          <View style={styles.supportTextContainer}>
            <Text style={styles.supportBannerTitle}>Ainda tem dúvidas?</Text>
            <Text style={styles.supportBannerText}>{supportEmail}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {userFaqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}

        <View style={styles.divider} />
        <Text style={styles.faqSectionTitle}>⚙️ FAQ – Suporte</Text>

        {FAQ_SUPORTE.map((faq, index) => (
          <View key={`sup-${index}`} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "android" ? 20 : 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalCancelText: { fontSize: 16, color: PRIMARY_BLUE, fontWeight: "600" },
  modalCloseBtn: { width: 80 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: DARK_TEXT },
  modalContent: { padding: 20, backgroundColor: "#F8FAFC" },
  faqSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 16,
    marginTop: 8,
  },

  supportBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF", 
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  supportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A", 
    marginBottom: 2,
  },
  supportBannerText: {
    fontSize: 13,
    color: PRIMARY_BLUE,
    fontWeight: "500",
  },

  faqCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 8,
    lineHeight: 22,
  },
  faqAnswer: { fontSize: 14, color: "#64748B", lineHeight: 22 },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 24 },
});
