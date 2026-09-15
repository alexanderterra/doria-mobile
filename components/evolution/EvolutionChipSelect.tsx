import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EvolutionChipSelectProps {
  options: string[];
  selectedValues: string | string[];
  onSelect: (value: string) => void;
}

export function EvolutionChipSelect({
  options,
  selectedValues,
  onSelect,
}: EvolutionChipSelectProps) {
  const isSelected = (item: string) => {
    if (Array.isArray(selectedValues)) {
      return selectedValues.includes(item);
    }
    return selectedValues === item;
  };

  return (
    <View style={styles.chipsContainer}>
      {options.map((item) => {
        const active = isSelected(item);
        return (
          <TouchableOpacity
            key={item}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  chipTextActive: { color: "#3B82F6", fontWeight: "700" },
});
