import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const MEDICATION_CHANNEL_ID = "medication_channel";
const MEDICATION_CATEGORY_ID = "MEDICATION_ALARM";

export async function setupNotificationCategories() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(MEDICATION_CHANNEL_ID, {
      name: "Alertas de Medicação",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3B82F6",
      sound: "default",
    });
  }

  await Notifications.setNotificationCategoryAsync(MEDICATION_CATEGORY_ID, [
    {
      identifier: "TAKEN",
      buttonTitle: "Tomei",
      options: { opensAppToForeground: false },
    },
    {
      identifier: "NOT_TAKEN",
      buttonTitle: "Não tomei",
      options: { opensAppToForeground: true },
    },
    {
      identifier: "SNOOZE",
      buttonTitle: "Lembrar em 15 min",
      options: { opensAppToForeground: true },
    },
  ]);
}

export async function cancelMedicationNotifications(
  medId: string | number,
): Promise<void> {
  if (!medId) {
    console.warn("cancelMedicationNotifications chamado sem medId válido");
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    const data = notif.content.data || {};
    const notificationMedId = String(data.medId || "");
    const isSameMedication = notificationMedId === String(medId);

    const isSnooze = data.snooze === true;

    if (isSameMedication && !isSnooze) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function cancelAllMedicationNotifications(
  medId: string | number,
): Promise<void> {
  if (!medId) {
    console.warn("cancelAllMedicationNotifications chamado sem medId válido");
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    if (String(notif.content.data?.medId || "") === String(medId)) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

export async function cancelAllMedicationLocalNotifications(): Promise<void> {
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

function isValidDate(date: Date | null | undefined): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export async function scheduleMedicationDoses(
  medId: string | number,
  medName: string,
  alertTimes: string[],
  startDate: Date,
  endDate: Date | null,
  daysAhead: number = 7,
): Promise<void> {
  if (!medId) {
    console.warn("scheduleMedicationDoses chamado sem medId válido", {
      medId,
      medName,
    });
    return;
  }

  if (!alertTimes?.length) {
    console.warn("Medicação sem horários válidos:", {
      medId,
      medName,
    });
    return;
  }

  const now = Date.now();

  const safeStartDate = isValidDate(startDate) ? startDate : new Date();

  if (endDate && !isValidDate(endDate)) {
    console.warn("endDate inválida para medicação:", {
      medId,
      medName,
      endDate,
    });
    endDate = null;
  }

  if (endDate && endDate.getTime() <= now) {
    console.log("Medicação fora do período. Nenhuma notificação agendada:", {
      medId,
      medName,
      endDate,
    });
    await cancelMedicationNotifications(medId);
    return;
  }

  await cancelMedicationNotifications(medId);

  const maxScheduleWindow = now + daysAhead * 24 * 60 * 60 * 1000;

  const limitDate = endDate
    ? Math.min(endDate.getTime(), maxScheduleWindow)
    : maxScheduleWindow;

  const MAX_DOSES_PER_MED = 6;

  const validTimes = alertTimes
    .map((timeString) => {
      if (!timeString || !timeString.includes(":")) return null;

      const [hoursRaw, minutesRaw] = timeString.split(":").map(Number);

      if (
        Number.isNaN(hoursRaw) ||
        Number.isNaN(minutesRaw) ||
        hoursRaw < 0 ||
        hoursRaw > 23 ||
        minutesRaw < 0 ||
        minutesRaw > 59
      ) {
        console.warn("Horário inválido ignorado:", {
          medId,
          medName,
          timeString,
        });
        return null;
      }

      return {
        hours: hoursRaw,
        minutes: minutesRaw,
        label: `${String(hoursRaw).padStart(2, "0")}:${String(
          minutesRaw,
        ).padStart(2, "0")}`,
      };
    })
    .filter(Boolean) as {
    hours: number;
    minutes: number;
    label: string;
  }[];

  if (!validTimes.length) {
    console.warn("Nenhum horário válido para agendamento:", {
      medId,
      medName,
      alertTimes,
    });
    return;
  }

  const candidateDoses: Date[] = [];
  const iterDate = new Date(Math.max(safeStartDate.getTime(), now));
  iterDate.setHours(0, 0, 0, 0);

  while (iterDate.getTime() <= limitDate) {
    for (const time of validTimes) {
      const doseDate = new Date(iterDate);
      doseDate.setHours(time.hours, time.minutes, 0, 0);

      const doseTime = doseDate.getTime();

      if (doseTime <= now) continue;
      if (doseTime < safeStartDate.getTime()) continue;
      if (doseTime > limitDate) continue;

      candidateDoses.push(doseDate);
    }

    iterDate.setDate(iterDate.getDate() + 1);
  }

  const nextDoses = candidateDoses
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, MAX_DOSES_PER_MED);

  let scheduledCount = 0;

  for (const doseDate of nextDoses) {
    const doseTime = doseDate.getTime();
    const preAlarmTime = doseTime - 30 * 60 * 1000;

    if (preAlarmTime > now) {
      const preIdentifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Seu cuidado continua 🌿",
          body: `Faltam 30 minutos para sua dose de ${medName}. Se puder, já deixe tudo preparado 😊`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            medId: String(medId),
            medName,
            type: "pre-alarm",
            scheduledFor: new Date(preAlarmTime).toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(preAlarmTime),
          channelId: MEDICATION_CHANNEL_ID,
        },
      });

      console.log("Pré-alerta de medicação agendado:", {
        identifier: preIdentifier,
        medId,
        medName,
        scheduledFor: new Date(preAlarmTime).toISOString(),
      });
    }

    const alarmIdentifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "DOR.IA: Hora da sua medicação! 💊",
        body: `Estou aqui para te acompanhar. Hora de tomar seu ${medName}. Toque aqui para registrar.`,
        categoryIdentifier: MEDICATION_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          medId: String(medId),
          medName,
          type: "alarm",
          url: "/(app)/medication-alarm",
          scheduledFor: doseDate.toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: doseDate,
        channelId: MEDICATION_CHANNEL_ID,
      },
    });

    console.log("Alarme de medicação agendado:", {
      identifier: alarmIdentifier,
      medId,
      medName,
      scheduledFor: doseDate.toISOString(),
    });

    scheduledCount++;
  }

  console.log("Resumo de agendamento da medicação:", {
    medId,
    medName,
    dosesScheduled: scheduledCount,
    alertTimes,
    nextDoses: nextDoses.map((date) => date.toISOString()),
    startDate: safeStartDate.toISOString(),
    endDate: endDate ? endDate.toISOString() : null,
    limitDate: new Date(limitDate).toISOString(),
  });
}

export async function scheduleMedicationSequence(
  medName: string,
  date: Date,
  medId: string | number,
) {
  if (!medId) {
    console.warn("scheduleMedicationSequence chamado sem medId válido", {
      medId,
      medName,
    });
    return;
  }

  if (!isValidDate(date)) {
    console.warn("scheduleMedicationSequence chamado com data inválida", {
      medId,
      medName,
      date,
    });
    return;
  }

  const targetTime = date.getTime();
  const now = Date.now();
  const preAlarmTime = targetTime - 30 * 60000;

  if (preAlarmTime > now) {
    const preIdentifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Seu cuidado continua 🌿",
        body: `Faltam 30 minutos para sua dose de ${medName}. Se puder, já deixe tudo preparado 😊`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          medId: String(medId),
          medName,
          type: "pre-alarm",
          scheduledFor: new Date(preAlarmTime).toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(preAlarmTime),
        channelId: MEDICATION_CHANNEL_ID,
      },
    });

    console.log("Pré-alerta avulso agendado:", {
      identifier: preIdentifier,
      medId,
      medName,
      scheduledFor: new Date(preAlarmTime).toISOString(),
    });
  }

  if (targetTime > now) {
    const alarmIdentifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "DOR.IA: Hora da sua medicação! 💊",
        body: `Estou aqui para te acompanhar. Hora de tomar seu ${medName}. Toque aqui para registrar.`,
        categoryIdentifier: MEDICATION_CATEGORY_ID,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          medId: String(medId),
          medName,
          type: "alarm",
          url: "/(app)/medication-alarm",
          scheduledFor: date.toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: MEDICATION_CHANNEL_ID,
      },
    });

    console.log("Alarme avulso agendado:", {
      identifier: alarmIdentifier,
      medId,
      medName,
      scheduledFor: date.toISOString(),
    });
  }
}
