import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

import IconeDoriaBranco from "../assets/images/IconeDoriaBranco.svg";
import logoPlanny from "../assets/images/logoPlanny.png";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const footerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      Animated.delay(300),

      Animated.timing(footerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      Animated.delay(1200),
    ]).start(() => {
      router.replace("/(auth)/welcome");
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient
      colors={["#60A5FA", "#3B82F6", "#1D4ED8"]}
      locations={[0, 0.55, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <IconeDoriaBranco width={180} height={180} fill="#FFFFFF" />

        <Animated.Text
          style={{
            marginTop: 16,
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
            letterSpacing: 1,
            lineHeight: 22,
            opacity: textFadeAnim,
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          Conectando quem sente dor a quem sabe cuidar.
        </Animated.Text>
      </Animated.View>

      <Animated.Image
        source={logoPlanny}
        style={{
          position: "absolute",
          bottom: 50,
          alignSelf: "center",
          width: 100,
          height: 40,
          tintColor: "#FFFFFF",
          resizeMode: "contain",
          opacity: footerFadeAnim,
        }}
      />
    </LinearGradient>
  );
}
