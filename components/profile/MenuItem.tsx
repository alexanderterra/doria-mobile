import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

export type FeatherIconName = keyof typeof Feather.glyphMap;

interface MenuItemProps {
  icon: FeatherIconName;
  label: string;
  description: string;
  onPress: () => void;
  showDivider?: boolean;
}

export function MenuItem({
  icon,
  label,
  description,
  onPress,
  showDivider = false,
}: MenuItemProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.menuIconWrap}>
          <Feather name={icon} size={18} color={PRIMARY_BLUE} />
        </View>
        <View style={styles.menuText}>
          <Text style={styles.menuLabel}>{label}</Text>
          <Text style={styles.menuDesc}>{description}</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#CBD5E1" />
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { flex: 1 },
  menuLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 2,
  },
  menuDesc: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },
});
