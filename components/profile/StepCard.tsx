import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProgressBar } from "./ProgressBar"; 

const PRIMARY_BLUE = "#3B82F6";
const GREEN = "#16A34A";
const DARK_TEXT = "#0F172A";
const SECONDARY_TEXT = "#64748B";
const BLUE_BG = "#EFF6FF";
const GREEN_BG = "#F0FDF4";
const GREEN_BORDER = "#BBF7D0";
const BORDER = "#F1F5F9";
const CARD_BG = "#FFFFFF";

interface StepCardProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle: string;
  progress: number;
  onPress: () => void;
}

export function StepCard({
  icon,
  title,
  subtitle,
  progress,
  onPress,
}: StepCardProps) {
  const isComplete = progress >= 1;
  const accent = isComplete ? GREEN : PRIMARY_BLUE;
  const iconBg = isComplete ? GREEN_BG : BLUE_BG;
  const cardBorder = isComplete ? GREEN_BORDER : BORDER;
  const cardBg = isComplete ? GREEN_BG : CARD_BG;

  return (
    <TouchableOpacity
      style={[
        styles.stepCard,
        { borderColor: cardBorder, backgroundColor: cardBg },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.stepIconBox, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={18} color={accent} />
      </View>

      <View style={styles.stepBody}>
        <View style={styles.stepTitleRow}>
          <Text style={styles.stepTitle}>{title}</Text>
          {isComplete && (
            <Feather name="check-circle" size={16} color={GREEN} />
          )}
        </View>
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
        <ProgressBar progress={progress} showPercentage={false} />
      </View>

      <Feather name="chevron-right" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  stepIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBody: { flex: 1, gap: 5 },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepTitle: { fontSize: 15, fontWeight: "700", color: DARK_TEXT },
  stepSubtitle: { fontSize: 12, color: SECONDARY_TEXT },
});
