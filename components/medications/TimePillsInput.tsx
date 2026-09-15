import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface TimePillsInputProps {
  times: string[];
  onAddTime: () => void;
  onRemoveTime: (time: string) => void;
  onEditTime: (index: number) => void;
}

export function TimePillsInput({
  times,
  onAddTime,
  onRemoveTime,
  onEditTime,
}: TimePillsInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Horários dos Alertas</Text>
      <Text style={styles.subtitle}>
        Toque no horário para editar ou no X para remover.
      </Text>

      <View style={styles.pillsWrapper}>
        {times.map((time, index) => (
          <View key={`${time}-${index}`} style={styles.pillContainer}>
            <TouchableOpacity
              style={styles.pillTextBtn}
              onPress={() => onEditTime(index)}
            >
              <Feather name="clock" size={14} color="#FFFFFF" />
              <Text style={styles.pillText}>{time}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pillCloseBtn}
              onPress={() => onRemoveTime(time)}
            >
              <Feather name="x" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={onAddTime}>
          <Feather name="plus" size={16} color={PRIMARY_BLUE} />
          <Text style={styles.addBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "700", color: DARK_TEXT, marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#64748B", marginBottom: 12 },
  pillsWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 20,
    overflow: "hidden",
  },
  pillTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 6,
  },
  pillText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  pillCloseBtn: {
    paddingVertical: 8,
    paddingRight: 12,
    paddingLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  addBtnText: { color: PRIMARY_BLUE, fontSize: 14, fontWeight: "600" },
});
