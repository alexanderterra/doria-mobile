import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface LogoutButtonProps {
  onPress: () => void;
  label?: string;
}

export function LogoutButton({
  onPress,
  label = "Sair da conta",
}: LogoutButtonProps) {
  return (
    <TouchableOpacity
      style={styles.logoutBtn}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Feather name="log-out" size={18} color="#EF4444" />
      <Text style={styles.logoutText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
});
