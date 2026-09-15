import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const DARK_TEXT = "#0F172A";

interface MedicationFormProps {
  medicationName: string;
  onChangeMedicationName: (text: string) => void;
}

export function MedicationForm({
  medicationName,
  onChangeMedicationName,
}: MedicationFormProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Nome do Medicamento</Text>
      <View style={styles.inputContainer}>
        <Feather name="plus-square" size={20} color="#94A3B8" />
        <TextInput
          style={styles.input}
          placeholder="Ex: Paracetamol"
          placeholderTextColor="#94A3B8"
          value={medicationName}
          onChangeText={onChangeMedicationName}
        />
      </View>
    </View>
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    height: 56,
  },
  input: { flex: 1, fontSize: 15, color: DARK_TEXT, marginLeft: 12 },
});
