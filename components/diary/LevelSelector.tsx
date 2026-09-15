import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LevelSelectorProps {
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
}

const getActiveColor = (num: number): string => {
  if (num <= 3) return "#EF4444";
  if (num <= 7) return "#EAB308";
  return "#22C55E";
};

export function LevelSelector({
  selectedLevel,
  onSelectLevel,
}: LevelSelectorProps) {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
        const isSelected = selectedLevel === num;
        const activeColor = getActiveColor(num);

        return (
          <TouchableOpacity
            key={num}
            activeOpacity={0.7}
            onPress={() => onSelectLevel(num)}
            style={[
              styles.bubble,
              isSelected && {
                backgroundColor: activeColor,
                borderColor: activeColor,
              },
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                isSelected && styles.bubbleTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  bubbleTextSelected: {
    color: "#FFFFFF",
  },
});
