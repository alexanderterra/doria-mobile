import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface NotificationToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

export function NotificationToggle({
  enabled,
  onToggle,
}: NotificationToggleProps) {
  return (
    <View style={styles.toggleCard}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.toggleIconArea}>
          <Feather name="bell" size={20} color="#64748B" />
        </View>
        <View>
          <Text style={styles.toggleTitle}>Notificações</Text>
          <Text style={styles.toggleSubtitle}>Receba avisos no celular</Text>
        </View>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: "#E2E8F0", true: PRIMARY_BLUE }}
        thumbColor={"#FFFFFF"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    marginBottom: 24,
  },
  toggleIconArea: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toggleTitle: { fontSize: 14, fontWeight: "700", color: DARK_TEXT },
  toggleSubtitle: { fontSize: 12, color: "#64748B" },
});
