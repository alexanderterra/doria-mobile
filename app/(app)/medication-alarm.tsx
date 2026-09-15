import { api } from "@/services/api/api";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEDICATION_CHANNEL_ID = "medication_channel";
const MEDICATION_CATEGORY_ID = "MEDICATION_ALARM";

function isValidMedicationId(value: string) {
  return Boolean(value) && value !== "undefined" && value !== "null";
}

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

export default function MedicationAlarmScreen() {
  const { medName, medId } = useLocalSearchParams();

  const safeMedId = String(Array.isArray(medId) ? medId[0] : medId || "");
  const safeMedName = String(
    Array.isArray(medName) ? medName[0] : medName || "",
  );

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

  const handleAction = async (status: "taken" | "missed" | "snoozed") => {
    const interactionTime = new Date().toISOString();

    console.log("Ação na tela de alarme:", {
      medName: safeMedName,
      medId: safeMedId,
      status,
      interactionTime,
    });

    if (!isValidMedicationId(safeMedId)) {
      Alert.alert("Erro", "Identificador da medicação não encontrado.", [
        { text: "OK", onPress: () => router.replace("/(app)/medications") },
      ]);
      return;
    }

    if (status === "taken" || status === "missed") {
      const tomou = status === "taken";

      try {
        await api.post("/controle-medicacoes", {
          id_medicacoes: safeMedId,
          tomou,
        });

        Alert.alert(
          tomou ? "Muito bem!" : "Aviso",
          tomou
            ? "Dose registrada com sucesso."
            : "Você marcou que não tomou esta dose.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(app)/medications"),
            },
          ],
        );

        return;
      } catch (error) {
        console.error("Erro ao salvar controle:", error);

        Alert.alert(
          "Erro",
          "Não foi possível registrar a dose. Tente novamente.",
          [
            {
              text: "Entendi",
              onPress: () => router.replace("/(app)/medications"),
            },
          ],
        );

        return;
      }
    }

    if (status === "snoozed") {
      try {
        const scheduledFor = new Date(Date.now() + 15 * 60 * 1000);

        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ Lembrete de Medicação",
            body: `Você pediu para lembrar: hora de tomar ${
              safeMedName || "sua medicação"
            }.`,
            categoryIdentifier: MEDICATION_CATEGORY_ID,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: {
              medId: safeMedId,
              medName: safeMedName || "Medicação",
              type: "alarm",
              url: "/(app)/medication-alarm",
              snooze: true,
              scheduledFor: scheduledFor.toISOString(),
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: scheduledFor,
            channelId: MEDICATION_CHANNEL_ID,
          },
        });

        console.log("Soneca agendada pela tela medication-alarm:", {
          identifier,
          medId: safeMedId,
          medName: safeMedName,
          scheduledFor: scheduledFor.toISOString(),
        });

        Alert.alert("Aviso", "Lembrança agendada para daqui a 15 minutos.", [
          { text: "OK", onPress: () => router.replace("/(app)/medications") },
        ]);

        return;
      } catch (error) {
        console.error("Erro ao agendar soneca:", error);

        Alert.alert(
          "Erro",
          "Não foi possível agendar o lembrete. Tente novamente.",
          [
            {
              text: "Entendi",
              onPress: () => router.replace("/(app)/medications"),
            },
          ],
        );
      }
    }
  };

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

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fade, transform: [{ translateY: slide }] },
          ]}
        >
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/doriaLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.centerBlock}>
            <View style={styles.iconCircle}>
              <Feather name="clock" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.timeText}>
              {new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            <View style={styles.medCard}>
              <Text style={styles.instruction}>Hora do seu medicamento</Text>
              <Text style={styles.medName} numberOfLines={2}>
                {safeMedName || "Sua Medicação"}
              </Text>
            </View>

            <Text style={styles.encouragement}>
              Manter a rotina faz toda a diferença no seu tratamento. Você está
              indo bem.
            </Text>
          </View>

          <View style={styles.bottomBlock}>
            <View style={styles.mainButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleAction("missed")}
                style={[styles.btnAction, styles.btnMissed]}
              >
                <Feather name="x" size={22} color="#FFFFFF" />
                <Text style={styles.textMissed}>Não Tomei</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleAction("taken")}
                style={[styles.btnAction, styles.btnTaken]}
              >
                <Feather name="check" size={22} color="#3B82F6" />
                <Text style={styles.textTaken}>Tomei!</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleAction("snoozed")}
              style={styles.btnIgnore}
            >
              <Feather name="bell" size={20} color="#FFFFFF" />
              <Text style={styles.textIgnore}>Lembrar daqui a 15 minutos</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 60,
    tintColor: "#FFFFFF",
    opacity: 0.9,
  },
  centerBlock: {
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  timeText: {
    fontSize: 72,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  medCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    width: "100%",
  },
  instruction: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    fontWeight: "400",
    marginBottom: 6,
  },
  medName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  encouragement: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  bottomBlock: {
    width: "100%",
    gap: 14,
  },
  mainButtonsRow: {
    flexDirection: "row",
    gap: 14,
  },
  btnAction: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnMissed: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  textMissed: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  btnTaken: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  textTaken: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "800",
  },
  btnIgnore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    gap: 10,
    marginTop: 4,
  },
  textIgnore: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
