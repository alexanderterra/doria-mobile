import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface ConsultationFormProps {
  nome: string;
  dataConsulta: Date;
  horaConsulta: Date;
  notificacaoAtiva: boolean;
  isEditing: boolean;
  globalNotifEnabled: boolean;
  onNomeChange: (text: string) => void;
  onDataPress: () => void;
  onHoraPress: () => void;
  onNotificacaoChange: (value: boolean) => void;
}

export function ConsultationForm({
  nome,
  dataConsulta,
  horaConsulta,
  notificacaoAtiva,
  isEditing,
  globalNotifEnabled,
  onNomeChange,
  onDataPress,
  onHoraPress,
  onNotificacaoChange,
}: ConsultationFormProps) {
  return (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Título / Médico</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Cardiologista - Dr. João"
          value={nome}
          onChangeText={onNomeChange}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity style={styles.pickerBox} onPress={onDataPress}>
            <Feather name="calendar" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.pickerText}>
              {dataConsulta.toLocaleDateString("pt-BR")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Horário</Text>
          <TouchableOpacity style={styles.pickerBox} onPress={onHoraPress}>
            <Feather name="clock" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.pickerText}>
              {horaConsulta.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.switchGroup}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.switchTitle}>Notificações</Text>
          <Text style={styles.switchSub}>
            Receba lembretes um dia antes e uma hora antes.
          </Text>

          {globalNotifEnabled === false ? (
            <Text style={styles.globalWarning}>
              ⚠️ Os alertas estão desativados nas configurações gerais do seu
              perfil.
            </Text>
          ) : null}
        </View>

        <Switch
          style={{ marginTop: 4 }}
          value={globalNotifEnabled ? notificacaoAtiva : false}
          onValueChange={onNotificacaoChange}
          disabled={!globalNotifEnabled}
          trackColor={{ false: "#E2E8F0", true: "#93C5FD" }}
          thumbColor={
            notificacaoAtiva && globalNotifEnabled ? PRIMARY_BLUE : "#F8FAFC"
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 16,
    color: DARK_TEXT,
  },
  rowInputs: { flexDirection: "row", gap: 16 },
  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
  },
  pickerText: { fontSize: 16, color: DARK_TEXT },
  switchGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 32,
  },
  switchTitle: { fontSize: 16, fontWeight: "600", color: DARK_TEXT },
  switchSub: { fontSize: 13, color: "#64748B", marginTop: 4 },
  globalWarning: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
    fontWeight: "500",
  },
});
