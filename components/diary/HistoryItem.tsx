import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DARK_TEXT = "#0F172A";

interface HistoryItemProps {
  id: number | string;
  date: string;
  level: number;
  sleepLevel?: number;
  anxietyLevel?: number;
  note: string;
  onEdit?: () => void;
}

const getMetricColor = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "#CBD5E1";
  
  if (val >= 8) return "#22C55E";   
  if (val >= 5) return "#EAB308";   
  return "#EF4444";                
};

export function HistoryItem({
  date,
  level,
  sleepLevel,
  anxietyLevel,
  note,
  onEdit,
}: HistoryItemProps) {
  const renderBadge = (
    icon: keyof typeof Feather.glyphMap,
    val?: number | null,
  ) => {
    const color = getMetricColor(val);
    const displayVal = val !== undefined && val !== null ? val : "-";

    return (
      <View
        style={[
          styles.badgeContainer,
          { borderColor: color + "40", backgroundColor: color + "10" },
        ]}
      >
        <Feather name={icon} size={14} color={color} />
        <Text style={[styles.badgeValue, { color: color }]}>{displayVal}</Text>
      </View>
    );
  };

  const hasNote =
    note && note.trim() !== "" && note !== "Nenhum detalhe adicionado.";

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.infoColumn}>
          <View style={styles.dateRow}>
            <Feather name="calendar" size={12} color="#94A3B8" />
            <Text style={styles.dateText}>{date}</Text>
          </View>

          <View style={styles.metricsRow}>
            {renderBadge("activity", level)}
            {renderBadge("moon", sleepLevel)}
            {renderBadge("wind", anxietyLevel)}
          </View>
        </View>

        {onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="edit-2" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {hasNote && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 10,
  },

  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoColumn: {
    flex: 1,
    gap: 10, 
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: "800",
  },

  editButton: {
    padding: 4,
    marginLeft: 10,
  },

  noteContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  noteText: {
    fontSize: 13,
    color: DARK_TEXT,
    lineHeight: 18,
  },
});
