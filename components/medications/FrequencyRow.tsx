import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FrequencyRowProps {
  frequency: string;
  onFrequencyPress: () => void;
}

export function FrequencyRow({
  frequency,
  onFrequencyPress,
}: FrequencyRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Frequência</Text>
      <TouchableOpacity
        style={styles.inputBox}
        onPress={onFrequencyPress}
        activeOpacity={0.7}
      >
        <Text style={styles.inputText}>
          {frequency || "Selecione a frequência"}
        </Text>
        <Feather name="chevron-down" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputText: { fontSize: 15, color: "#0F172A" },
});
