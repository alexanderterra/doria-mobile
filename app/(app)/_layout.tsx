import { useAuth } from "@/contexts/AuthContext";
import { medicationsService } from "@/services/medications/medicationsService";
import {
  cancelAllMedicationNotifications,
  scheduleMedicationDoses,
} from "@/services/notifications/medicationNotifications";
import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DoriaIcone from "../../assets/images/doriaIcone.png";

function getUserRole(user: any, fallbackRole?: string | null) {
  return (
    fallbackRole ||
    user?.role ||
    user?.perfil ||
    user?.tipo_usuario ||
    user?.tipo ||
    ""
  )
    .trim()
    .toLowerCase();
}

function parseLocalDate(
  value?: string | Date | null,
  endOfDay: boolean = false,
): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    const date = new Date(value);

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) return null;

    const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      const date = new Date(year, month - 1, day);

      if (endOfDay) {
        date.setHours(23, 59, 59, 999);
      } else {
        date.setHours(0, 0, 0, 0);
      }

      return date;
    }

    const date = new Date(trimmedValue);

    if (Number.isNaN(date.getTime())) return null;

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  return null;
}

function isTruthyNotificationValue(value: any): boolean {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1" ||
    value === undefined ||
    value === null
  );
}

function isContinuousMedication(value: any): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

async function cancelAllMedicationLocalNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    const data = notif.content.data || {};

    const isMedicationNotification =
      data.medId ||
      data.type === "alarm" ||
      data.type === "pre-alarm" ||
      data.url === "/(app)/medication-alarm";

    if (isMedicationNotification) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

function CustomTabBar({ state, descriptors, navigation, role }: any) {
  const insets = useSafeAreaInsets();
  const currentRouteName = state.routes[state.index].name;

  if (
    currentRouteName === "complete-profile" ||
    currentRouteName === "notifications" ||
    currentRouteName === "medication-alarm" ||
    currentRouteName === "settings" ||
    currentRouteName === "pain-assessment" ||
    currentRouteName === "evolutions-history" ||
    currentRouteName === "certificates"
  ) {
    return null;
  }

  const orderedRoutes =
    role === "especialista"
      ? ["courses", "chat", "profile"]
      : ["diary", "medications", "chat", "consultations", "profile"];

  const sortedRoutes = orderedRoutes
    .map((routeName) => {
      const routeIndex = state.routes.findIndex(
        (r: any) => r.name === routeName,
      );
      if (routeIndex !== -1) return state.routes[routeIndex];
      return null;
    })
    .filter(Boolean);

  const isFewTabs = sortedRoutes.length <= 3;

  const getIconAndLabel = (routeName: string) => {
    if (routeName === "chat") return { label: "Chat" };
    if (routeName === "diary")
      return { iconName: "activity", label: "Minha\nJornada" };
    if (routeName === "consultations")
      return { iconName: "calendar", label: "Consultas" };
    if (routeName === "medications")
      return { iconName: "plus-square", label: "Medicações" };
    if (routeName === "courses")
      return { iconName: "book-open", label: "Cursos" };
    if (routeName === "profile") return { iconName: "user", label: "Perfil" };
    return null;
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 12,
          justifyContent: isFewTabs ? "center" : "space-between",
          gap: isFewTabs ? 40 : 0,
        },
      ]}
    >
      {sortedRoutes.map((route: any) => {
        const { options } = descriptors[route.key];
        const isFocused =
          state.index ===
          state.routes.findIndex((r: any) => r.name === route.name);
        const isChat = route.name === "chat";

        if (options.href === null) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconLabel = getIconAndLabel(route.name);
        if (!iconLabel) return null;

        const { iconName, label } = iconLabel;

        if (isChat) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[styles.chatButtonContainer, !isFewTabs && { flex: 1 }]}
            >
              <View
                style={[
                  styles.chatButton,
                  isFocused && styles.chatButtonFocused,
                ]}
              >
                <Image
                  source={DoriaIcone}
                  style={{
                    width: 34,
                    height: 34,
                    tintColor: isFocused ? "#FFFFFF" : "#3B82F6",
                  }}
                  resizeMode="contain"
                />
              </View>

              <Text
                style={[
                  styles.chatLabel,
                  { color: isFocused ? "#3B82F6" : "#94A3B8" },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={[
              styles.tabItem,
              isFocused && styles.tabItemFocused,
              !isFewTabs && { flex: 1 },
            ]}
          >
            <Feather
              name={iconName as any}
              size={22}
              color={isFocused ? "#3B82F6" : "#94A3B8"}
            />

            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? "#3B82F6" : "#94A3B8" },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { user, role, isLoadingAuth } = useAuth();

  const cleanRole = getUserRole(user, role);

  useEffect(() => {
    let isMounted = true;

    const scheduleMedications = async () => {
      if (isLoadingAuth) return;

      if (!user) return;

      if (cleanRole !== "paciente") {
        console.log(
          "Usuário não-paciente dentro do app. Cancelando notificações locais de medicação.",
        );

        await cancelAllMedicationLocalNotifications();
        return;
      }

      try {
        const permission = await Notifications.getPermissionsAsync();

        if (permission.status !== "granted" && !permission.granted) {
          console.warn(
            "Medicações não agendadas: permissão de notificação não concedida.",
          );
          return;
        }

        const isMedicacoesOn = (user as any)?.notif_medicacoes !== false;

        if (!isMedicacoesOn) {
          console.log(
            "Notificações de medicação desativadas globalmente. Cancelando pendentes.",
          );

          await cancelAllMedicationLocalNotifications();
          return;
        }

        const res = await medicationsService.getMedications();

        if (!isMounted) return;

        if (!res.success || !res.data) {
          console.warn("Nenhuma medicação retornada para agendamento:", res);
          return;
        }

        for (const med of res.data) {
          const medId =
            med.id_medicacoes ||
            med.id ||
            med.uuid ||
            med.medicationId ||
            med.idMedicacao;

          if (!medId) {
            console.warn("Medicação sem ID válido. Ignorando:", med);
            continue;
          }

          const medName = med.nome || med.medicationName || "Medicação";

          const shouldNotify = isTruthyNotificationValue(
            med.notificacao_alerta,
          );

          if (!shouldNotify) {
            console.log(
              "Notificação desativada para medicação. Cancelando pendentes:",
              {
                medId,
                medName,
              },
            );

            await cancelAllMedicationNotifications(medId);
            continue;
          }

          if (!med.horarios || typeof med.horarios !== "string") {
            console.warn("Medicação sem horários válidos. Ignorando:", {
              medId,
              medName,
              horarios: med.horarios,
            });

            await cancelAllMedicationNotifications(medId);
            continue;
          }

          const alertTimes = med.horarios
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);

          if (!alertTimes.length) {
            console.warn("Nenhum horário válido após parse:", {
              medId,
              medName,
              horarios: med.horarios,
            });

            await cancelAllMedicationNotifications(medId);
            continue;
          }

          const startDate =
            parseLocalDate(
              med.periodo_inicio || med.data_inicio || med.inicio,
              false,
            ) || new Date();

          const continuo = isContinuousMedication(med.continuo);

          let endDate: Date | null = null;

          if (med.frequencia === "Uso único") {
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
          } else if (!continuo) {
            endDate = parseLocalDate(
              med.periodo_fim || med.data_fim || med.fim,
              true,
            );
          }

          console.log("Preparando agendamento da medicação:", {
            medId,
            medName,
            alertTimes,
            startDate: startDate.toISOString(),
            endDate: endDate ? endDate.toISOString() : null,
            continuo,
          });

          await scheduleMedicationDoses(
            medId,
            medName,
            alertTimes,
            startDate,
            endDate,
            7,
          );
        }

        const pending = await Notifications.getAllScheduledNotificationsAsync();

        console.log("TOTAL DE NOTIFICAÇÕES PENDENTES:", pending.length);

        console.log(
          "NOTIFICAÇÕES PENDENTES DE MEDICAÇÃO:",
          pending
            .filter((n) => n.content.data?.medId)
            .map((n) => ({
              identifier: n.identifier,
              title: n.content.title,
              medId: n.content.data?.medId,
              medName: n.content.data?.medName,
              type: n.content.data?.type,
              snooze: n.content.data?.snooze,
              scheduledFor: n.content.data?.scheduledFor,
              trigger: n.trigger,
            })),
        );
      } catch (error) {
        console.log("Erro ao agendar medicações:", error);
      }
    };

    scheduleMedications();

    return () => {
      isMounted = false;
    };
  }, [cleanRole, isLoadingAuth, user]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (isLoadingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!user || !cleanRole) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      tabBar={(props) =>
        isKeyboardVisible ? (
          <View />
        ) : (
          <CustomTabBar {...props} role={cleanRole} />
        )
      }
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="diary"
        options={{ href: cleanRole === "especialista" ? null : undefined }}
      />

      <Tabs.Screen
        name="medications"
        options={{ href: cleanRole === "especialista" ? null : undefined }}
      />

      <Tabs.Screen
        name="consultations"
        options={{ href: cleanRole === "especialista" ? null : undefined }}
      />

      <Tabs.Screen name="chat" />

      <Tabs.Screen name="profile" />

      <Tabs.Screen
        name="courses"
        options={{ href: cleanRole === "paciente" ? null : undefined }}
      />

      <Tabs.Screen name="complete-profile" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="medication-alarm" options={{ href: null }} />
      <Tabs.Screen name="pain-assessment" options={{ href: null }} />
      <Tabs.Screen name="evolutions-history" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="certificates" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    shadowColor: "#191B23",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 4,
  },
  tabItemFocused: { backgroundColor: "#EFF6FF" },
  tabLabel: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
    marginTop: 4,
    textAlign: "center",
  },
  chatButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -8,
  },
  chatButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 4,
    transform: [{ translateY: -25 }],
  },
  chatButtonFocused: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
    shadowOpacity: 0.3,
  },
  chatLabel: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0,
    marginTop: -10,
    textAlign: "center",
  },
});
