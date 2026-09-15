import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ConsultationForm } from "./ConsultationForm";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface ConsultationModalProps {
  visible: boolean;
  isEditing: boolean;
  isSaving: boolean;
  nome: string;
  dataConsulta: Date;
  horaConsulta: Date;
  notificacaoAtiva: boolean;
  globalNotifEnabled: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onNomeChange: (text: string) => void;
  onDataPress: () => void;
  onHoraPress: () => void;
  onNotificacaoChange: (value: boolean) => void;
  children?: React.ReactNode;
}

export function ConsultationModal({
  visible,
  isEditing,
  isSaving,
  nome,
  dataConsulta,
  horaConsulta,
  notificacaoAtiva,
  globalNotifEnabled, 
  onClose,
  onSave,
  onDelete,
  onNomeChange,
  onDataPress,
  onHoraPress,
  onNotificacaoChange,
  children,
}: ConsultationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#F8FAFC" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isEditing ? "Editar Consulta" : "Nova Consulta"}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          <ConsultationForm
            nome={nome}
            dataConsulta={dataConsulta}
            horaConsulta={horaConsulta}
            notificacaoAtiva={notificacaoAtiva}
            isEditing={isEditing}
            globalNotifEnabled={globalNotifEnabled} 
            onNomeChange={onNomeChange}
            onDataPress={onDataPress}
            onHoraPress={onHoraPress}
            onNotificacaoChange={onNotificacaoChange}
          />

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Salvar na Agenda</Text>
            )}
          </TouchableOpacity>

          {isEditing && onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Feather name="trash-2" size={18} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Cancelar Consulta</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {children}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalCancelText: { fontSize: 16, color: "#64748B" },
  modalCloseBtn: { width: 80 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: DARK_TEXT },
  modalContent: { padding: 24 },
  saveBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
    padding: 12,
  },
  deleteBtnText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },
});
