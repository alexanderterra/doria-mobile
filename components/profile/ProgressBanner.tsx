import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const GREEN = "#16A34A";
const DARK_TEXT = "#0F172A";
const SECONDARY_TEXT = "#64748B";
const BLUE_BG = "#EFF6FF";
const CARD_BG = "#FFFFFF";
const BORDER = "#F1F5F9";
const BORDER_STRONG = "#E2E8F0";

interface ProgressBannerProps {
  sections: number[];
}

export function ProgressBanner({ sections }: ProgressBannerProps) {
  const overall = sections.reduce((a, b) => a + b, 0) / sections.length;
  const done = sections.filter((p) => p >= 1).length;
  const pct = Math.round(overall * 100);

  const animW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(animW, {
      toValue: overall,
      useNativeDriver: false,
      tension: 50,
      friction: 12,
    }).start();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overall]);

  const isComplete = overall >= 1;
  const barColor = isComplete ? GREEN : PRIMARY_BLUE;

  return (
    <View style={styles.bannerCard}>
      <View style={styles.bannerHeader}>
        <View style={styles.bannerIconBox}>
          <Feather name="bar-chart-2" size={15} color={PRIMARY_BLUE} />
        </View>
        <Text style={styles.bannerTitle}>Progresso do Perfil</Text>
        <Text style={[styles.bannerPct, { color: barColor }]}>{pct}%</Text>
      </View>

      <View style={styles.bannerBody}>
        <View style={styles.bannerTrack}>
          <Animated.View
            style={[
              styles.bannerFill,
              {
                backgroundColor: barColor,
                width: animW.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.bannerSub}>
          {done} de {sections.length} etapas concluídas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_STRONG,
    overflow: "hidden",
    marginBottom: 4,
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  bannerIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: BLUE_BG,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  bannerTitle: { fontSize: 15, fontWeight: "700", color: DARK_TEXT, flex: 1 },
  bannerPct: { fontSize: 15, fontWeight: "700" },
  bannerBody: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14 },
  bannerTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: BORDER_STRONG,
    overflow: "hidden",
    marginBottom: 8,
  },
  bannerFill: { height: "100%", borderRadius: 3 },
  bannerSub: { fontSize: 12, color: SECONDARY_TEXT, fontWeight: "500" },
});
