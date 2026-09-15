import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface EvolutionFormCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function EvolutionFormCard({
  title,
  description,
  children,
}: EvolutionFormCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.questionTitle}>{title}</Text>
      <Text style={styles.questionDesc}>{description}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  questionDesc: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },
});
