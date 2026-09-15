import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SaveToastProps {
  visible: boolean;
  message: string;
}

export function SaveToast({ visible, message }: SaveToastProps) {
  const [render, setRender] = useState(false);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRender(true);
      translateY.value = withSpring(0, { damping: 15, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(-100, { damping: 15, stiffness: 90 });
      opacity.value = withTiming(0, { duration: 300 }, (isFinished) => {
        if (isFinished) {
          runOnJS(setRender)(false); 
        }
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!render) return null;

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <View style={styles.toastContent}>
        <Feather name="check-circle" size={20} color="#059669" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
});
