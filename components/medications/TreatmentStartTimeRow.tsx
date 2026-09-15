import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";

interface TreatmentStartTimeRowProps {
  time: string;
  onPress: () => void;
}

export function TreatmentStartTimeRow({
  time,
  onPress,
}: TreatmentStartTimeRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Horário de início do tratamento</Text>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>
          <Feather name="clock" size={18} color={PRIMARY_BLUE} />
        </View>
        <Text style={styles.timeText}>{time}</Text>
        <Feather name="chevron-right" size={18} color="#CBD5E1" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
});
