import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DIARY_CHANNEL_ID = "diary_channel";
const DIARY_CATEGORY_ID = "DIARY_REMINDER";
const DAILY_DIARY_TYPE = "daily-diary";

async function ensureNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === "granted" || currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return (
    requestedPermission.status === "granted" || requestedPermission.granted
  );
}

export async function setupDiaryNotificationCategories() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(DIARY_CHANNEL_ID, {
      name: "Lembrete Diário (Minha Jornada)",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
      sound: "default",
    });
  }

  await Notifications.setNotificationCategoryAsync(DIARY_CATEGORY_ID, [
    {
      identifier: "OPEN_DIARY",
      buttonTitle: "Registrar Agora 📝",
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function cancelDailyDiaryNotification() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    if (notif.content.data?.type === DAILY_DIARY_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleDailyDiaryNotification(
  hour: number = 9,
  minute: number = 0,
  userId?: string | number,
) {
  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    console.warn("Notificação diária da jornada não agendada: sem permissão.");
    return null;
  }

  await setupDiaryNotificationCategories();

  await cancelDailyDiaryNotification();

  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
    channelId: DIARY_CHANNEL_ID,
  };

  const nextTriggerDate = await Notifications.getNextTriggerDateAsync(trigger);

  console.log(
    "Próxima notificação da Minha Jornada:",
    nextTriggerDate ? new Date(nextTriggerDate).toISOString() : null,
  );

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "DOR.IA: Bom dia! ☀️",
      body: "Como você acordou hoje? Não esqueça de registrar sua jornada.",
      categoryIdentifier: DIARY_CATEGORY_ID,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: {
        type: DAILY_DIARY_TYPE,
        url: "/(app)/diary",
        userId: userId ? String(userId) : undefined,
      },
    },
    trigger,
  });

  console.log("Notificação diária da jornada agendada:", {
    identifier,
    hour,
    minute,
    userId,
    nextTriggerDate: nextTriggerDate
      ? new Date(nextTriggerDate).toISOString()
      : null,
  });

  return identifier;
}
