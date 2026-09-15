import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface ListHeaderProps {
  onFilterPress?: () => void;
  showFilter?: boolean;
  title?: string;
  subtitle?: string;
}

export function ListHeader({
  onFilterPress,
  showFilter = true,
  title = "Últimas Avaliações",
  subtitle = "Acompanhamento detalhado",
}: ListHeaderProps) {
  const handleNewEvaluation = () => {
    router.push("/(app)/pain-assessment");
  };

  return (
    <View style={styles.listHeader}>
      <View>
        <Text style={styles.listTitle}>{title}</Text>
        <Text style={styles.listSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.actionRow}>
        {showFilter && (
          <TouchableOpacity style={styles.iconButton} onPress={onFilterPress}>
            <Feather name="filter" size={20} color="#64748B" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNewEvaluation}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Avaliar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  listTitle: { fontSize: 18, fontWeight: "800", color: DARK_TEXT },
  listSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 12 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_BLUE,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
