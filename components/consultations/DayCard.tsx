import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";
const LIGHT_TEXT = "#64748B";

interface DayCardProps {
  dayWeek: string;
  dayNum: string;
  isSelected: boolean;
  isToday?: boolean;
  onPress: () => void;
}

export function DayCard({
  dayWeek,
  dayNum,
  isSelected,
  isToday = false,
  onPress,
}: DayCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.dayCard, isSelected && styles.dayCardSelected]}
    >
      <Text style={[styles.dayWeekText, isSelected && styles.textSelected]}>
        {dayWeek}
      </Text>
      <View
        style={[styles.dayNumBadge, isSelected && styles.dayNumBadgeSelected]}
      >
        <Text style={[styles.dayNumText, isSelected && styles.textSelected]}>
          {dayNum}
        </Text>
      </View>
      {isToday && !isSelected && <View style={styles.todayDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dayCard: {
    alignItems: "center",
    width: 56,
    height: 76,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  dayCardSelected: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: "#2563EB",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  dayWeekText: {
    fontSize: 12,
    fontWeight: "600",
    color: LIGHT_TEXT,
    marginBottom: 6,
  },
  dayNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumBadgeSelected: { backgroundColor: "rgba(255,255,255,0.2)" },
  dayNumText: { fontSize: 15, fontWeight: "800", color: DARK_TEXT },
  textSelected: { color: "#FFFFFF" },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY_BLUE,
    position: "absolute",
    bottom: 6,
  },
});
