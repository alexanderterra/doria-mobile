import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function AnimatedOrb({
  size,
  top,
  left,
  right,
  bottom,
  color,
  delay = 0,
  duration = 4000,
}: {
  size: number;
  top?: number | `${number}%`;
  left?: number | `${number}%`;
  right?: number | `${number}%`;
  bottom?: number | `${number}%`;
  color: string;
  delay?: number;
  duration?: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const floatY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -22,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    );

    const floatX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 14,
          duration: duration * 1.3,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -14,
          duration: duration * 1.3,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: duration * 1.1,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: duration * 1.1,
          useNativeDriver: true,
        }),
      ]),
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: duration * 0.8,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]),
    );

    floatY.start();
    floatX.start();
    pulse.start();
    glow.start();
  }, [delay, duration, opacity, scale, translateX, translateY]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
}

export default function WelcomeScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  return (
    <LinearGradient
      colors={["#60A5FA", "#3B82F6", "#1D4ED8"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <AnimatedOrb
        size={320}
        top={-100}
        right={-100}
        color="rgba(255,255,255,0.08)"
        delay={0}
        duration={5000}
      />
      <AnimatedOrb
        size={260}
        top="30%"
        left={-120}
        color="rgba(14,217,149,0.12)"
        delay={800}
        duration={4200}
      />
      <AnimatedOrb
        size={200}
        bottom={120}
        right={-60}
        color="rgba(255,255,255,0.06)"
        delay={1600}
        duration={3800}
      />
      <AnimatedOrb
        size={140}
        top="20%"
        right={40}
        color="rgba(14,217,149,0.09)"
        delay={400}
        duration={4600}
      />
      <AnimatedOrb
        size={100}
        bottom="25%"
        left={30}
        color="rgba(255,255,255,0.07)"
        delay={1200}
        duration={3500}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 28,
            paddingTop: 60,
            paddingBottom: 48,
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Image
              source={require("../../assets/images/doriaLogo.png")}
              style={{ width: 240, height: 110, tintColor: "#FFFFFF" }}
              resizeMode="contain"
            />
          </View>

          <View style={{ width: "100%", gap: 14 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/(auth)/register")}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
                paddingVertical: 17,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 14,
                elevation: 8,
              }}
            >
              <Text
                style={{ color: "#3B82F6", fontSize: 16, fontWeight: "700" }}
              >
                Começar agora →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push("/(auth)/login")}
              style={{
                borderRadius: 18,
                paddingVertical: 15,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.5)",
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}
              >
                Já tenho uma conta
              </Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginTop: 10,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#FFFFFF",
                }}
              />
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.4)",
                }}
              />
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.4)",
                }}
              />
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}
