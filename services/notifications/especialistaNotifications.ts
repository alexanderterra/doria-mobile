import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const ESPECIALISTA_CHANNEL_ID = "especialista_cta_channel";
const ESPECIALISTA_CATEGORY_ID = "ESPECIALISTA_CTA";
const ESPECIALISTA_CTA_TYPE = "cta-especialista";

const WEEKLY_MESSAGES = [
  {
    weekday: 2, // segunda-feira
    title: "Uma semana de atendimentos está começando 💬",
    body: "Converse com o Assistente DOR.IA sobre uma dúvida clínica, tema científico ou evidência relacionada à dor.",
  },
  {
    weekday: 4, // quarta-feira
    title: "Encontrou uma situação clínica que merece ser aprofundada? 🔎",
    body: "Converse com o Assistente DOR.IA e explore o tema a partir do conhecimento científico disponível.",
  },
  {
    weekday: 6, // sexta-feira
    title: "Uma segunda perspectiva pode abrir novas perguntas 💡",
    body: "Use o Assistente DOR.IA para aprofundar temas e evidências relacionados à sua prática.",
  },
];

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

export async function setupEspecialistaNotificationCategories() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ESPECIALISTA_CHANNEL_ID, {
      name: "Assistente DOR.IA (Especialista)",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
      sound: "default",
    });
  }

  await Notifications.setNotificationCategoryAsync(ESPECIALISTA_CATEGORY_ID, [
    {
      identifier: "OPEN_CHAT",
      buttonTitle: "Conversar agora 💬",
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function cancelEspecialistaNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    if (notif.content.data?.type === ESPECIALISTA_CTA_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleEspecialistaWeeklyNotifications(
  userId?: string | number,
) {
  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    console.warn(
      "Notificações do especialista não agendadas: sem permissão.",
    );
    return null;
  }

  await setupEspecialistaNotificationCategories();

  await cancelEspecialistaNotifications();

  const identifiers: string[] = [];

  for (const message of WEEKLY_MESSAGES) {
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: message.weekday,
      hour: 8,
      minute: 0,
      channelId: ESPECIALISTA_CHANNEL_ID,
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        categoryIdentifier: ESPECIALISTA_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: ESPECIALISTA_CTA_TYPE,
          url: "/(app)/chat",
          userId: userId ? String(userId) : undefined,
        },
      },
      trigger,
    });

    identifiers.push(identifier);

    console.log("Notificação semanal do especialista agendada:", {
      identifier,
      weekday: message.weekday,
      hour: 8,
      minute: 0,
      userId,
    });
  }

  return identifiers;
}
