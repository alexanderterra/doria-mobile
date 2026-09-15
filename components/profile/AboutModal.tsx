import React from "react";
import {
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

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AboutModal({ visible, onClose }: AboutModalProps) {
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
        <Text style={styles.modalTitle}>Sobre a DOR.IA</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            A <Text style={styles.aboutHighlight}>DOR.IA</Text> é uma plataforma
            digital criada para acolher, orientar e conectar pessoas que
            convivem com dor a profissionais especializados.
          </Text>
          <Text style={styles.aboutText}>
            Por meio de inteligência artificial, a DOR.IA atua como um primeiro
            ponto de contato, ajudando o paciente a compreender melhor o que
            está sentindo e a encontrar o profissional mais adequado para o seu
            caso.
          </Text>
          <Text style={styles.aboutText}>
            Ao mesmo tempo, apoia profissionais de saúde ao conectar pacientes
            de forma mais direcionada, contribuindo para uma jornada de cuidado
            mais eficiente e qualificada.
          </Text>
          <Text style={styles.aboutText}>
            A DOR.IA não realiza diagnósticos, mas organiza o início da jornada
            do paciente com informação responsável, acolhimento e conexão com
            especialistas.
          </Text>

          <View style={styles.purposeBox}>
            <Text style={styles.purposeTitle}>Nosso propósito é simples:</Text>
            <Text style={styles.purposeHighlight}>
              — Ninguém deve enfrentar a dor sozinho.
            </Text>
          </View>

          <View style={styles.partnerBox}>
            <Text style={styles.partnerText}>
              “Uma iniciativa em parceria com a SBED”
            </Text>
          </View>
        </View>
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
  aboutCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569",
    marginBottom: 16,
    textAlign: "justify",
  },
  aboutHighlight: { color: PRIMARY_BLUE, fontWeight: "800" },
  purposeBox: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_BLUE,
  },
  purposeTitle: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
    marginBottom: 4,
  },
  purposeHighlight: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "800",
    fontStyle: "italic",
  },
  partnerBox: { alignItems: "center", marginTop: 10 },
  partnerText: {
    fontSize: 14,
    color: "#94A3B8",
    fontStyle: "italic",
    fontWeight: "600",
  },
});
