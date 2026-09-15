import React from "react";
import { Platform, StyleSheet, Switch, Text, View } from "react-native";

interface ContinuousUseToggleProps {
  isContinuous: boolean;
  onToggle: (value: boolean) => void;
}

export function ContinuousUseToggle({
  isContinuous,
  onToggle,
}: ContinuousUseToggleProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Uso Contínuo</Text>
        <Text style={styles.subtitle}>Não possui data de término</Text>
      </View>
      <Switch
        value={isContinuous}
        onValueChange={onToggle}
        trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
        thumbColor={isContinuous ? "#3B82F6" : "#FFFFFF"}
        style={Platform.OS === "android" ? styles.switchAndroid : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  switchAndroid: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }], 
  },
});
