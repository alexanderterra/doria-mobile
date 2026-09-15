import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface TreatmentPeriodCardProps {
  startDate: string;
  endDate: string | null;
  onStartDatePress: () => void;
  onEndDatePress: () => void;
}

export function TreatmentPeriodCard({
  startDate,
  endDate,
  onStartDatePress,
  onEndDatePress,
}: TreatmentPeriodCardProps) {
  return (
    <View style={styles.periodCard}>
      <View style={styles.periodHeader}>
        <Feather name="calendar" size={18} color={PRIMARY_BLUE} />
        <Text style={styles.periodTitle}>Período do Tratamento</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.flex1} onPress={onStartDatePress}>
          <Text style={styles.dateLabel}>INÍCIO</Text>
          <Text style={styles.dateValue}>{startDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.flex1} onPress={onEndDatePress}>
          <Text style={styles.dateLabel}>TÉRMINO</Text>
          <Text style={[styles.dateValue, !endDate && styles.placeholder]}>
            {endDate || "Selecionar data"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  periodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    marginBottom: 20,
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  periodTitle: { fontSize: 14, fontWeight: "800", color: DARK_TEXT },
  row: { flexDirection: "row", gap: 12 },
  flex1: { flex: 1 },
  dateLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: DARK_TEXT,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    paddingBottom: 8,
  },
  placeholder: { color: "#94A3B8" },
});
