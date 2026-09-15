import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const GREEN = "#16A34A";
const BORDER_STRONG = "#E2E8F0";

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  barColor?: string;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  barColor,
}: ProgressBarProps) {
  const animW = useRef(new Animated.Value(0)).current;
  const isComplete = progress >= 1;
  const finalBarColor = barColor || (isComplete ? GREEN : PRIMARY_BLUE);

  useEffect(() => {
    animW.setValue(0);
    Animated.spring(animW, {
      toValue: progress,
      useNativeDriver: false,
      tension: 60,
      friction: 14,
    }).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  return (
    <View style={styles.progressRow}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: finalBarColor,
              width: animW.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.progressPct, { color: finalBarColor }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER_STRONG,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressPct: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "right",
  },
});
