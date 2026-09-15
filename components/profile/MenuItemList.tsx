import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { FeatherIconName, MenuItem } from "./MenuItem";

export interface MenuItemData {
  icon: FeatherIconName;
  label: string;
  description: string;
  onPress: () => void;
}

interface MenuItemListProps {
  items: MenuItemData[];
}

export function MenuItemList({ items }: MenuItemListProps) {
  return (
    <View style={styles.menuCard}>
      {items.map((item, index) => (
        <MenuItem
          key={item.label}
          {...item}
          showDivider={index < items.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
});
