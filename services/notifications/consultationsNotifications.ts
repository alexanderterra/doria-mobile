import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const CONSULTATION_CHANNEL_ID = "consultation_channel";
const CONSULTATION_CATEGORY_ID = "CONSULTATION_REMINDER";
const CONSULTATION_TYPE = "consultation";

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

function isValidDate(date: Date | null | undefined): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export async function setupConsultationCategories() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CONSULTATION_CHANNEL_ID, {
      name: "Lembretes de Consultas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
      sound: "default",
    });
  }

  await Notifications.setNotificationCategoryAsync(CONSULTATION_CATEGORY_ID, [
    {
      identifier: "OPEN_CONSULTATIONS",
      buttonTitle: "Ver agenda 📅",
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function cancelConsultationNotifications(
  consultationId: string | number,
) {
  if (!consultationId && consultationId !== 0) {
    console.warn("cancelConsultationNotifications chamado sem ID válido");
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    const data = notif.content.data || {};

    if (String(data.consultationId || "") === String(consultationId)) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  console.log("Notificações de consulta canceladas:", {
    consultationId,
  });
}

export async function cancelAllConsultationLocalNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    if (notif.content.data?.type === CONSULTATION_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function scheduleConsultationNotifications(
  consultationId: string | number,
  title: string,
  dateObj: Date,
  timeObj: Date,
  userId?: string | number,
) {
  if (!consultationId && consultationId !== 0) {
    console.warn("Consulta sem ID. Notificações não agendadas.", {
      consultationId,
      title,
    });
    return null;
  }

  if (!isValidDate(dateObj) || !isValidDate(timeObj)) {
    console.warn("Data ou horário inválido para consulta:", {
      consultationId,
      title,
      dateObj,
      timeObj,
    });
    return null;
  }

  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    console.warn("Notificações de consulta não agendadas: sem permissão.");
    return null;
  }

  await setupConsultationCategories();

  await cancelConsultationNotifications(consultationId);

  const targetDate = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    timeObj.getHours(),
    timeObj.getMinutes(),
    0,
    0,
  );

  const targetTimeMs = targetDate.getTime();
  const now = Date.now();

  if (targetTimeMs <= now) {
    console.log("Consulta já passou. Nenhuma notificação agendada:", {
      consultationId,
      title,
      targetDate: targetDate.toISOString(),
    });

    return null;
  }

  const oneDayBefore = targetTimeMs - 24 * 60 * 60 * 1000;
  const oneHourBefore = targetTimeMs - 60 * 60 * 1000;

  const timeLabel = targetDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const scheduledIdentifiers: string[] = [];

  if (oneDayBefore > now) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "DOR.IA: Consulta amanhã! 📅",
        body: `Lembrete: você tem uma consulta (${title}) amanhã às ${timeLabel}.`,
        categoryIdentifier: CONSULTATION_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          consultationId: String(consultationId),
          type: CONSULTATION_TYPE,
          url: "/(app)/consultations",
          reminderType: "one-day-before",
          consultationDate: targetDate.toISOString(),
          userId: userId ? String(userId) : undefined,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(oneDayBefore),
        channelId: CONSULTATION_CHANNEL_ID,
      },
    });

    scheduledIdentifiers.push(identifier);

    console.log("Notificação de consulta agendada para 1 dia antes:", {
      identifier,
      consultationId,
      title,
      scheduledFor: new Date(oneDayBefore).toISOString(),
      consultationDate: targetDate.toISOString(),
    });
  }

  if (oneHourBefore > now) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "DOR.IA: Consulta em 1 hora! ⏰",
        body: `Sua consulta (${title}) é daqui a pouco. Não se atrase!`,
        categoryIdentifier: CONSULTATION_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          consultationId: String(consultationId),
          type: CONSULTATION_TYPE,
          url: "/(app)/consultations",
          reminderType: "one-hour-before",
          consultationDate: targetDate.toISOString(),
          userId: userId ? String(userId) : undefined,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(oneHourBefore),
        channelId: CONSULTATION_CHANNEL_ID,
      },
    });

    scheduledIdentifiers.push(identifier);

    console.log("Notificação de consulta agendada para 1 hora antes:", {
      identifier,
      consultationId,
      title,
      scheduledFor: new Date(oneHourBefore).toISOString(),
      consultationDate: targetDate.toISOString(),
    });
  }

  if (!scheduledIdentifiers.length) {
    console.log(
      "Consulta próxima demais para alertas de 1 dia/1 hora. Nenhuma notificação agendada:",
      {
        consultationId,
        title,
        targetDate: targetDate.toISOString(),
      },
    );
  }

  const pending = await Notifications.getAllScheduledNotificationsAsync();

  console.log(
    "NOTIFICAÇÕES PENDENTES DE CONSULTA:",
    pending
      .filter(
        (n) =>
          n.content.data?.type === CONSULTATION_TYPE ||
          n.content.data?.consultationId,
      )
      .map((n) => ({
        identifier: n.identifier,
        title: n.content.title,
        consultationId: n.content.data?.consultationId,
        reminderType: n.content.data?.reminderType,
        consultationDate: n.content.data?.consultationDate,
        userId: n.content.data?.userId,
        trigger: n.trigger,
      })),
  );

  return scheduledIdentifiers;
}
