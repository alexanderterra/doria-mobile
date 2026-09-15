import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReportTermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

export function ReportTermsModal({
  visible,
  onClose,
  onAccept,
}: ReportTermsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconBox}>
            <Feather name="shield" size={32} color={PRIMARY_BLUE} />
          </View>

          <Text style={styles.title}>Termo de Responsabilidade</Text>

          <Text style={styles.description}>
            O relatório da sua jornada contém{" "}
            <Text style={styles.highlight}>dados sensíveis de saúde</Text>, como
            níveis de dor, estado emocional e qualidade do sono.
          </Text>

          <View style={styles.alertBox}>
            <Feather name="alert-triangle" size={20} color="#D97706" />
            <Text style={styles.alertText}>
              Ao baixar ou compartilhar este documento (com médicos, familiares
              ou terceiros), você assume total responsabilidade pela privacidade
              e proteção destas informações.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptText}>Eu compreendo e aceito</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  highlight: { fontWeight: "700", color: DARK_TEXT },
  alertBox: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 24,
    gap: 12,
  },
  alertText: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18 },
  buttonRow: { flexDirection: "row", gap: 12, width: "100%" },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#64748B" },
  acceptButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY_BLUE,
    alignItems: "center",
  },
  acceptText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});
