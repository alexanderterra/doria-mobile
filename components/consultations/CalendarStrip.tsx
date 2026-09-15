import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { DayCard } from "./DayCard";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface DayData {
  id: number;
  dayWeek: string;
  dayNum: string;
  isToday?: boolean;
}

interface CalendarStripProps {
  monthYear: string;
  days: DayData[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onCalendarPress?: () => void;
}

export function CalendarStrip({
  monthYear,
  days,
  selectedDate,
  onSelectDate,
  onCalendarPress,
}: CalendarStripProps) {
  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Text style={styles.monthText}>{monthYear}</Text>
        <TouchableOpacity
          style={styles.calendarIconBtn}
          onPress={onCalendarPress}
        >
          <Feather name="calendar" size={20} color={PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekScroll}
      >
        {days.map((day) => (
          <DayCard
            key={day.id}
            dayWeek={day.dayWeek}
            dayNum={day.dayNum}
            isSelected={selectedDate === day.dayNum}
            isToday={day.isToday}
            onPress={() => onSelectDate(day.dayNum)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#94A3B8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 16,
  },
  monthText: { fontSize: 18, fontWeight: "800", color: DARK_TEXT },
  calendarIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  weekScroll: { paddingHorizontal: 16, gap: 12 },
});
