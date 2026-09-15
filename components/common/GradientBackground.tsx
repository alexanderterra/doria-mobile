import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ColorValue, ViewStyle } from "react-native";


interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: ColorValue[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  colors = ["#60A5FA", "#3B82F6", "#1D4ED8"],
  locations = [0, 0.55, 1],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
}) => {
  return (
    <LinearGradient
      colors={colors as any}
      locations={locations as any}
      start={start}
      end={end}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
};
