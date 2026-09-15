import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DARK_TEXT = "#0F172A";
const LIGHT_TEXT = "#64748B";

interface EmptyConsultationsProps {
  title?: string;
  message?: string;
}

export function EmptyConsultations({
  title = "Nenhuma consulta",
  message = "Você não tem compromissos agendados para este dia.",
}: EmptyConsultationsProps) {
  return (
    <View style={styles.emptyState}>
      <Feather name="calendar" size={48} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: LIGHT_TEXT,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
