import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";

interface ProfileHeroProps {
  name: string;
  email: string;
  showEditButton?: boolean;
  onEditPress?: () => void;
}

export function ProfileHero({
  name,
  email,
  showEditButton = true,
  onEditPress,
}: ProfileHeroProps) {
  const handleEditPress = () => {
    if (onEditPress) {
      onEditPress();
    } else {
      router.push("/(app)/complete-profile");
    }
  };

  return (
    <LinearGradient
      colors={["#60A5FA", "#3B82F6", "#1D4ED8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.avatarRing}>
        <View style={styles.avatarInner}>
          <Feather name="user" size={32} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.heroName}>{name}</Text>
      <Text style={styles.heroEmail}>{email}</Text>

      {showEditButton && (
        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={handleEditPress}
        >
          <Feather name="edit-2" size={13} color="#FFFFFF" />
          <Text style={styles.editBtnText}>Completar perfil</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 28,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_BLUE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
