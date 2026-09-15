import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const EVOLUTION_CHANNEL_ID = "evolution_channel";
const EVOLUTION_CATEGORY_ID = "EVOLUTION_REMINDER";
const EVOLUTION_TYPE = "avaliacao-dor";

async function ensureNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === "granted" || currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return requestedPermission.status === "granted" || requestedPermission.granted;
}

export async function setupAssessmentNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(EVOLUTION_CHANNEL_ID, {
      name: "Avaliação Semanal",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
      sound: "default",
    });
  }

  await Notifications.setNotificationCategoryAsync(EVOLUTION_CATEGORY_ID, [
    {
      identifier: "OPEN_EVOLUTION",
      buttonTitle: "Avaliar agora 📝",
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function cancelWeeklyEvolutionNotification() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    if (notif.content.data?.type === EVOLUTION_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleWeeklyEvolution(userId?: string | number) {
  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    console.warn("Notificação semanal de evolução não agendada: sem permissão.");
    return null;
  }

  await setupAssessmentNotificationChannel();

  await cancelWeeklyEvolutionNotification();

  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: 1, 
    hour: 14,
    minute: 0,
    channelId: EVOLUTION_CHANNEL_ID,
  };

  const nextTriggerDate = await Notifications.getNextTriggerDateAsync(trigger);

  console.log(
    "Próxima notificação da Minha Evolução:",
    nextTriggerDate ? new Date(nextTriggerDate).toISOString() : null,
  );

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Minha Evolução 📝",
      body: "Boa tarde! Chegou o momento da sua avaliação semanal. Tire 2 minutinhos para registrar como foi a sua dor.",
      categoryIdentifier: EVOLUTION_CATEGORY_ID,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: {
        type: EVOLUTION_TYPE,
        url: "/(app)/pain-assessment",
        userId: userId ? String(userId) : undefined,
      },
    },
    trigger,
  });

  console.log("Notificação semanal de evolução agendada:", {
    identifier,
    weekday: 1,
    hour: 14,
    minute: 0,
    userId,
    nextTriggerDate: nextTriggerDate
      ? new Date(nextTriggerDate).toISOString()
      : null,
  });

  return identifier;
}