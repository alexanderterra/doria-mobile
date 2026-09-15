import { Header } from "@/components/common/Header";
import { useAuth } from "@/contexts/AuthContext";
import { agendaService } from "@/services/agenda/agendaService";
import { medicationsService } from "@/services/medications/medicationsService";
import {
  cancelWeeklyEvolutionNotification,
  scheduleWeeklyEvolution,
} from "@/services/notifications/assessmentNotifications";
import { scheduleConsultationNotifications } from "@/services/notifications/consultationsNotifications";
import {
  cancelDailyDiaryNotification,
  scheduleDailyDiaryNotification,
} from "@/services/notifications/diaryNotifications";
import { scheduleMedicationDoses } from "@/services/notifications/medicationNotifications";
import { profileService } from "@/services/profile/profileService";
import { Feather } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

type NotificationPrefs = {
  notif_medicacoes: boolean;
  notif_jornada: boolean;
  notif_avaliacao: boolean;
  notif_consultas: boolean;
};

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
  disabled?: boolean;
}

function SettingRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  isLast,
  disabled,
}: SettingRowProps) {
  return (
    <View
      style={[
        styles.settingRow,
        !isLast && styles.borderBottom,
        disabled && { opacity: 0.6 },
      ]}
    >
      <View style={styles.iconBg}>
        <Feather name={icon} size={20} color={PRIMARY_BLUE} />
      </View>

      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <Switch
        trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
        thumbColor={value ? PRIMARY_BLUE : "#F8FAFC"}
        ios_backgroundColor="#E2E8F0"
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
      />
    </View>
  );
}

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

function isEnabledPreference(value: any, fallback: boolean = true): boolean {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }

  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }

  return fallback;
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

function parseConsultationDate(value?: string | Date | null): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12,
      0,
      0,
      0,
    );
  }

  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
  }

  return null;
}

function parseConsultationTime(value?: string | Date | null): Date | null {
  const date = new Date();

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    date.setHours(value.getHours(), value.getMinutes(), 0, 0);
    return date;
  }

  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);

    if (match) {
      const hours = Number(match[1]);
      const minutes = Number(match[2]);

      if (
        !Number.isNaN(hours) &&
        !Number.isNaN(minutes) &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
      ) {
        date.setHours(hours, minutes, 0, 0);
        return date;
      }
    }
  }

  return null;
}

function getConsultationId(item: any): string | number | null {
  return (
    item?.id_consulta ||
    item?.id_agenda ||
    item?.id ||
    item?.uuid ||
    item?.consultationId ||
    null
  );
}

async function cancelAllLocalMedicationNotifications() {
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

  console.log("Todas as notificações locais de medicação foram canceladas.");
}

async function cancelAllLocalConsultationNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const notif of scheduled) {
    const data = notif.content.data || {};

    const isConsultationNotification =
      data.consultationId ||
      data.type === "consultation" ||
      data.url === "/(app)/consultations";

    if (isConsultationNotification) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  console.log("Todas as notificações locais de consulta foram canceladas.");
}

async function cancelAllPatientLocalNotifications() {
  await cancelAllLocalMedicationNotifications();
  await cancelDailyDiaryNotification();
  await cancelWeeklyEvolutionNotification();
  await cancelAllLocalConsultationNotifications();

  console.log("Todas as notificações locais de paciente foram canceladas.");
}

async function scheduleAllActiveMedicationNotifications() {
  await cancelAllLocalMedicationNotifications();

  const res = await medicationsService.getMedications();

  if (!res.success || !Array.isArray(res.data)) {
    console.warn("Não foi possível reagendar medicações:", res);
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

    const shouldNotify = isTruthyNotificationValue(med.notificacao_alerta);

    if (!shouldNotify) {
      continue;
    }

    if (!med.horarios || typeof med.horarios !== "string") {
      console.warn("Medicação sem horários válidos. Ignorando:", {
        medId,
        medName,
        horarios: med.horarios,
      });
      continue;
    }

    const alertTimes = med.horarios
      .split(",")
      .map((time: string) => time.trim())
      .filter(Boolean);

    if (!alertTimes.length) {
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

  console.log(
    "Medicações reagendadas pela tela de notificações. Total pendente:",
    pending.length,
  );
}

async function scheduleAllActiveConsultationNotifications(
  userId?: string | number,
) {
  await cancelAllLocalConsultationNotifications();

  const res = await agendaService.getAgenda();

  if (!res.success || !Array.isArray(res.data)) {
    console.warn("Não foi possível reagendar consultas:", res);
    return;
  }

  for (const item of res.data) {
    const consultationId = getConsultationId(item);

    if (!consultationId) {
      console.warn("Consulta sem ID válido. Ignorando:", item);
      continue;
    }

    const shouldNotify = isTruthyNotificationValue(
      item.notificacao ??
        item.notificacao_ativa ??
        item.notification ??
        item.notificacaoAtiva,
    );

    if (!shouldNotify) {
      continue;
    }

    const title = item.nome || item.title || item.titulo || "Consulta";

    const dateObj = parseConsultationDate(
      item.data || item.data_consulta || item.date || item.consultationDate,
    );

    const timeObj = parseConsultationTime(
      item.horario ||
        item.hora ||
        item.hora_consulta ||
        item.time ||
        item.consultationTime,
    );

    if (!dateObj || !timeObj) {
      console.warn("Consulta com data ou horário inválido. Ignorando:", {
        consultationId,
        title,
        data: item.data,
        horario: item.horario || item.hora || item.hora_consulta,
      });
      continue;
    }

    await scheduleConsultationNotifications(
      consultationId,
      title,
      dateObj,
      timeObj,
      userId,
    );
  }

  const pending = await Notifications.getAllScheduledNotificationsAsync();

  console.log(
    "Consultas reagendadas pela tela de notificações. Total pendente:",
    pending.length,
  );
}

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    notif_medicacoes: true,
    notif_jornada: true,
    notif_avaliacao: true,
    notif_consultas: true,
  });

  useFocusEffect(
    useCallback(() => {
      const fetchPreferences = async () => {
        try {
          const response = await profileService.getMe();

          if (response.success && response.data) {
            const userData = response.data;

            setPrefs({
              notif_medicacoes: isEnabledPreference(
                userData.notif_medicacoes,
                true,
              ),
              notif_jornada: isEnabledPreference(
                userData.notif_jornada,
                true,
              ),
              notif_avaliacao: isEnabledPreference(
                userData.notif_avaliacao,
                true,
              ),
              notif_consultas: isEnabledPreference(
                userData.notif_consultas,
                true,
              ),
            });
          }
        } catch (error) {
          console.error("Erro ao carregar preferências", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPreferences();
    }, []),
  );

  const handleLocalNotificationUpdate = async (
    key: keyof NotificationPrefs,
    newValue: boolean,
  ) => {
    const userId = getUserId(user);
    const role = getUserRole(user);

    if (role !== "paciente") {
      await cancelAllPatientLocalNotifications();

      console.log(
        "Preferência salva, mas notificações locais não foram agendadas porque o usuário não é paciente.",
      );

      return;
    }

    if (key === "notif_medicacoes") {
      if (newValue) {
        await scheduleAllActiveMedicationNotifications();
        console.log("Notificações de medicação ativadas e reagendadas.");
      } else {
        await cancelAllLocalMedicationNotifications();
        console.log("Notificações de medicação desativadas.");
      }

      return;
    }

    if (key === "notif_jornada") {
      if (newValue) {
        await scheduleDailyDiaryNotification(9, 0, userId);
        console.log("Minha Jornada ativada e agendada para 09:00.");
      } else {
        await cancelDailyDiaryNotification();
        console.log("Minha Jornada desativada e cancelada.");
      }

      return;
    }

    if (key === "notif_avaliacao") {
      if (newValue) {
        await scheduleWeeklyEvolution(userId);
        console.log("Minha Evolução ativada e agendada para domingo às 14:00.");
      } else {
        await cancelWeeklyEvolutionNotification();
        console.log("Minha Evolução desativada e cancelada.");
      }

      return;
    }

    if (key === "notif_consultas") {
      if (newValue) {
        await scheduleAllActiveConsultationNotifications(userId);
        console.log("Consultas ativadas e reagendadas.");
      } else {
        await cancelAllLocalConsultationNotifications();
        console.log("Consultas desativadas e canceladas.");
      }
    }
  };

  const handleToggle = async (
    key: keyof NotificationPrefs,
    newValue: boolean,
  ) => {
    const previousValue = prefs[key];

    setPrefs((prev) => ({ ...prev, [key]: newValue }));
    setIsUpdating(true);

    try {
      const payload = { [key]: newValue };
      const res = await profileService.updateNotifications(payload);

      if (!res.success) {
        setPrefs((prev) => ({ ...prev, [key]: previousValue }));
        Alert.alert("Erro", "Não foi possível salvar sua preferência.");
        return;
      }

      await handleLocalNotificationUpdate(key, newValue);
    } catch (error) {
      console.error("Erro ao atualizar preferência de notificação:", error);

      setPrefs((prev) => ({ ...prev, [key]: previousValue }));

      Alert.alert(
        "Erro",
        "Não foi possível atualizar essa preferência de notificação.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Header
        title="Notificações"
        showBackButton={true}
        onBack={() => router.push("/(app)/profile")}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.sectionTitle}>Preferências de Alertas</Text>

          <Text style={styles.sectionSubtitle}>
            Escolha quais tipos de aviso do aplicativo DOR.IA você deseja
            receber no seu celular.
          </Text>

          <View style={styles.card}>
            <SettingRow
              icon="plus-square"
              title="Medicações"
              description="Lembretes para você tomar seus remédios."
              value={prefs.notif_medicacoes}
              onValueChange={(val) => handleToggle("notif_medicacoes", val)}
              disabled={isUpdating}
            />

            <SettingRow
              icon="activity"
              title="Minha Jornada"
              description="Lembrete diário às 09:00 para registrar como está se sentindo."
              value={prefs.notif_jornada}
              onValueChange={(val) => handleToggle("notif_jornada", val)}
              disabled={isUpdating}
            />

            <SettingRow
              icon="clipboard"
              title="Minha Evolução"
              description="Lembrete semanal todo domingo às 14:00 para registrar sua evolução."
              value={prefs.notif_avaliacao}
              onValueChange={(val) => handleToggle("notif_avaliacao", val)}
              disabled={isUpdating}
            />

            <SettingRow
              icon="calendar"
              title="Consultas"
              description="Alertas automáticos sobre seus agendamentos médicos próximos."
              value={prefs.notif_consultas}
              onValueChange={(val) => handleToggle("notif_consultas", val)}
              isLast={true}
              disabled={isUpdating}
            />
          </View>

          <View style={styles.infoBox}>
            <Feather name="info" size={18} color="#64748B" />

            <Text style={styles.infoText}>
              Caso você desative todas as opções, ainda poderá ver as
              informações diretamente ao abrir o aplicativo.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingTextContainer: { flex: 1, marginRight: 12 },
  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 4,
  },
  settingDescription: { fontSize: 13, color: "#64748B", lineHeight: 18 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: "#64748B", lineHeight: 20 },
});
