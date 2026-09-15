import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const LIGHT_BLUE = "#EFF6FF";

interface TypingIndicatorProps {
  text?: string;
}

export function TypingIndicator({
  text = "DOR.IA PENSANDO",
}: TypingIndicatorProps) {
  return (
    <View style={styles.typingWrap}>
      <ActivityIndicator size="small" color={PRIMARY_BLUE} />
      <Text style={styles.typingText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
    padding: 12,
    backgroundColor: LIGHT_BLUE,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
  },
  typingText: {
    fontSize: 12,
    color: PRIMARY_BLUE,
    fontWeight: "700",
  },
});
