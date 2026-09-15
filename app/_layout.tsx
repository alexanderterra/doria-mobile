import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api/api";
import {
  cancelWeeklyEvolutionNotification,
  scheduleWeeklyEvolution,
  setupAssessmentNotificationChannel,
} from "@/services/notifications/assessmentNotifications";
import {
  cancelAllConsultationLocalNotifications,
  setupConsultationCategories,
} from "@/services/notifications/consultationsNotifications";
import {
  cancelDailyDiaryNotification,
  scheduleDailyDiaryNotification,
  setupDiaryNotificationCategories,
} from "@/services/notifications/diaryNotifications";
import {
  cancelEspecialistaNotifications,
  scheduleEspecialistaWeeklyNotifications,
  setupEspecialistaNotificationCategories,
} from "@/services/notifications/especialistaNotifications";
import {
  cancelAllMedicationLocalNotifications,
  setupNotificationCategories,
} from "@/services/notifications/medicationNotifications";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const MEDICATION_CHANNEL_ID = "medication_channel";
const MEDICATION_CATEGORY_ID = "MEDICATION_ALARM";

let pendingNotificationRoute: any = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getUserRole(user: any) {
  return (user?.role || user?.perfil || user?.tipo_usuario || user?.tipo || "")
    .trim()
    .toLowerCase();
}

function getUserId(user: any): string | undefined {
  const id =
    user?.id_usuario || user?.id || user?.uuid || user?.user_id || user?.idUser;

  return id ? String(id) : undefined;
}

function isValidMedicationId(value: string) {
  return Boolean(value) && value !== "undefined" && value !== "null";
}

async function clearLastNotificationResponseSafely() {
  try {
    await Notifications.clearLastNotificationResponseAsync();
  } catch (error) {
    console.warn(
      "Não foi possível limpar a última resposta da notificação:",
      error,
    );
  }
}

function resolveRouteFromData(
  data: Record<string, any>,
  actionIdentifier: string,
): any | null {
  const type = data?.type;
  const url = data?.url;
  const medId = String(data?.medId || "");
  const medName = String(data?.medName || "Medicação");

  if (actionIdentifier === "OPEN_DIARY") {
    return "/(app)/diary";
  }
  if (actionIdentifier === "OPEN_EVOLUTION") {
    return "/(app)/pain-assessment";
  }
  if (actionIdentifier === "OPEN_CONSULTATIONS") {
    return "/(app)/consultations";
  }
  if (actionIdentifier === "OPEN_CHAT") {
    return "/(app)/chat";
  }
  if (actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
    return null;
  }

  if (type === "daily-diary" || url === "/(app)/diary") {
    return "/(app)/diary";
  }

  if (type === "avaliacao-dor" || url === "/(app)/pain-assessment") {
    return "/(app)/pain-assessment";
  }

  if (type === "cta-especialista" || url === "/(app)/chat") {
    return "/(app)/chat";
  }

  if (type === "consultation" || url === "/(app)/consultations") {
    return "/(app)/consultations";
  }

  if (
    type === "alarm" ||
    type === "check-in" ||
    url === "/(app)/medication-alarm"
  ) {
    return {
      pathname: "/(app)/medication-alarm",
      params: { medId, medName },
    };
  }

  return null;
}

async function scheduleMedicationSnooze(medId: string, medName: string) {
  if (!isValidMedicationId(medId)) {
    console.warn("Soneca ignorada: medId inválido", {
      medId,
      medName,
    });
    return;
  }

  const scheduledFor = new Date(Date.now() + 15 * 60 * 1000);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "⏰ Lembrete de Medicação",
      body: `Você pediu para lembrar: hora de tomar ${medName}.`,
      categoryIdentifier: MEDICATION_CATEGORY_ID,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        medId,
        medName,
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

  console.log("Soneca de medicação agendada:", {
    identifier,
    medId,
    medName,
    scheduledFor: scheduledFor.toISOString(),
  });
}

async function handleMedicationAction(
  action: string,
  data: Record<string, any>,
): Promise<boolean> {
  const medId = String(data.medId || "");
  const medName = String(data.medName || "Medicação");

  if (action === "TAKEN") {
    if (!isValidMedicationId(medId)) {
      console.warn("Ação 'Tomei' ignorada: medId inválido", data);
      return true;
    }

    try {
      await api.post("/controle-medicacoes", {
        id_medicacoes: medId,
        tomou: true,
      });

      console.log("Ação 'Tomei' registrada:", {
        medId,
        medName,
      });
    } catch (error) {
      console.error("Erro ao registrar 'Tomei':", error);
    }

    return true;
  }

  if (action === "NOT_TAKEN") {
    if (!isValidMedicationId(medId)) {
      console.warn("Ação 'Não tomei' ignorada: medId inválido", data);
      return true;
    }

    try {
      await api.post("/controle-medicacoes", {
        id_medicacoes: medId,
        tomou: false,
      });

      console.log("Ação 'Não tomei' registrada:", {
        medId,
        medName,
      });
    } catch (error) {
      console.error("Erro ao registrar 'Não tomei':", error);
    }

    return true;
  }

  if (action === "SNOOZE") {
    try {
      await scheduleMedicationSnooze(medId, medName);
    } catch (error) {
      console.error("Erro ao agendar soneca:", error);
    }

    return true;
  }

  return false;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      if (pendingNotificationRoute) {
        const route = pendingNotificationRoute;
        pendingNotificationRoute = null;

        setTimeout(() => {
          router.replace(route);
        }, 300);
      } else if (!inAppGroup) {
        router.replace("/(app)/chat");
      }
    }
  }, [user, isLoadingAuth, segments, router]);

  useEffect(() => {
    if (!user || isLoadingAuth) return;

    async function requestPermissionsIfNeeded() {
      const permission = await Notifications.getPermissionsAsync();

      if (permission.status !== "granted" && !permission.granted) {
        const requested = await Notifications.requestPermissionsAsync();

        console.log("Permissão de notificação solicitada:", {
          status: requested.status,
          granted: requested.granted,
        });
      } else {
        console.log("Permissão de notificação já concedida:", {
          status: permission.status,
          granted: permission.granted,
        });
      }
    }

    requestPermissionsIfNeeded();
  }, [user, isLoadingAuth]);

  useEffect(() => {
    async function cancelAllPatientLocalNotifications() {
      await cancelDailyDiaryNotification();
      await cancelAllMedicationLocalNotifications();
      await cancelWeeklyEvolutionNotification();
      await cancelAllConsultationLocalNotifications();
    }

    async function setupCategories() {
      if (!user || isLoadingAuth) return;

      const role = getUserRole(user);

      if (role === "especialista") {
        console.log(
          "Usuário especialista. Limpando notificações locais de paciente.",
        );
        await cancelAllPatientLocalNotifications();

        const permission = await Notifications.getPermissionsAsync();

        if (permission.status !== "granted" && !permission.granted) {
          console.warn(
            "Categorias/canais não configurados: permissão ainda não concedida.",
          );
          return;
        }

        await setupEspecialistaNotificationCategories();

        console.log("Categorias/canais de notificação (especialista) configurados");
        return;
      }

      if (role !== "paciente") {
        console.log(
          "Role desconhecida ou usuário deslogando. Limpando todas as notificações locais.",
        );
        await cancelAllPatientLocalNotifications();
        await cancelEspecialistaNotifications();
        return;
      }

      console.log(
        "Usuário paciente. Limpando notificações locais de especialista.",
      );
      await cancelEspecialistaNotifications();

      const permission = await Notifications.getPermissionsAsync();

      if (permission.status !== "granted" && !permission.granted) {
        console.warn(
          "Categorias/canais não configurados: permissão ainda não concedida.",
        );
        return;
      }

      await setupDiaryNotificationCategories();
      await setupNotificationCategories();
      await setupConsultationCategories();
      await setupAssessmentNotificationChannel();

      console.log("Categorias/canais de notificação configurados");
    }

    setupCategories();
  }, [user, isLoadingAuth]);

  useEffect(() => {
    async function scheduleRecurringNotifications() {
      if (!user || isLoadingAuth) return;

      const role = getUserRole(user);
      const userId = getUserId(user);

      if (role === "especialista") {
        await scheduleEspecialistaWeeklyNotifications(userId);

        const pending = await Notifications.getAllScheduledNotificationsAsync();

        console.log(
          "NOTIFICAÇÕES PENDENTES DO ESPECIALISTA:",
          pending
            .filter((n) => n.content.data?.type === "cta-especialista")
            .map((n) => ({
              identifier: n.identifier,
              title: n.content.title,
              data: n.content.data,
              trigger: n.trigger,
            })),
        );

        console.log(
          "Notificações semanais do especialista agendadas (seg/qua/sex às 08:00)",
        );
        return;
      }

      if (role !== "paciente") {
        console.log(
          "Notificações recorrentes não agendadas: usuário não é paciente.",
        );
        return;
      }

      const isDiarioOn =
        ((user as any)?.notif_jornada ?? (user as any)?.notif_diario) !== false;

      if (isDiarioOn) {
        await scheduleDailyDiaryNotification(9, 0, userId);

        const pending = await Notifications.getAllScheduledNotificationsAsync();

        console.log(
          "NOTIFICAÇÕES PENDENTES DA JORNADA:",
          pending
            .filter((n) => n.content.data?.type === "daily-diary")
            .map((n) => ({
              identifier: n.identifier,
              title: n.content.title,
              data: n.content.data,
              trigger: n.trigger,
            })),
        );

        console.log("Notificação diária da jornada agendada para 09:00");
      } else {
        await cancelDailyDiaryNotification();
        console.log(
          "Notificação diária da jornada cancelada: notif_diario false",
        );
      }

      const isEvolucaoOn = (user as any)?.notif_avaliacao !== false;

      if (isEvolucaoOn) {
        await scheduleWeeklyEvolution(userId);

        const pending = await Notifications.getAllScheduledNotificationsAsync();

        console.log(
          "NOTIFICAÇÕES PENDENTES DA EVOLUÇÃO:",
          pending
            .filter((n) => n.content.data?.type === "avaliacao-dor")
            .map((n) => ({
              identifier: n.identifier,
              title: n.content.title,
              data: n.content.data,
              trigger: n.trigger,
            })),
        );

        console.log(
          "Notificação semanal de evolução agendada para domingo às 14:00",
        );
      } else {
        await cancelWeeklyEvolutionNotification();
        console.log(
          "Notificação semanal de evolução cancelada: notif_avaliacao false",
        );
      }
    }

    scheduleRecurringNotifications();
  }, [user, isLoadingAuth]);

  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data as
            | Record<string, any>
            | undefined;

          const action = response.actionIdentifier;

          if (!data) return;

          const handledMedicationAction = await handleMedicationAction(
            action,
            data,
          );

          if (handledMedicationAction) {
            await clearLastNotificationResponseSafely();
            return;
          }

          const targetRoute = resolveRouteFromData(data, action);

          if (!targetRoute) {
            await clearLastNotificationResponseSafely();
            return;
          }

          if (!user) {
            pendingNotificationRoute = targetRoute;
          } else {
            setTimeout(() => {
              router.push(targetRoute);
            }, 100);
          }

          await clearLastNotificationResponseSafely();
        },
      );

    return () => {
      responseListener.remove();
    };
  }, [router, user]);

  useEffect(() => {
    if (isLoadingAuth) return;

    async function handleLastNotificationResponse() {
      const response = await Notifications.getLastNotificationResponseAsync();

      if (!response) return;

      const data = response.notification.request.content.data as
        | Record<string, any>
        | undefined;

      const action = response.actionIdentifier;

      if (!data) return;

      const handledMedicationAction = await handleMedicationAction(
        action,
        data,
      );

      if (handledMedicationAction) {
        await clearLastNotificationResponseSafely();
        return;
      }

      const targetRoute = resolveRouteFromData(data, action);

      if (!targetRoute) {
        await clearLastNotificationResponseSafely();
        return;
      }

      if (!user) {
        pendingNotificationRoute = targetRoute;
      } else {
        setTimeout(() => router.replace(targetRoute), 500);
      }

      await clearLastNotificationResponseSafely();
    }

    handleLastNotificationResponse();
  }, [isLoadingAuth, user, router]);

  if (isLoadingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#3B82F6",
        }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(app)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
