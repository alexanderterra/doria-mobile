import { medicationsService } from "@/services/medications/medicationsService";
import {
  cancelAllMedicationNotifications,
  cancelMedicationNotifications,
  scheduleMedicationDoses,
} from "@/services/notifications/medicationNotifications";
import { profileService } from "@/services/profile/profileService";
import { useEffect, useRef, useState } from "react";
import { Alert, LayoutAnimation, Platform, UIManager } from "react-native";
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INTERVAL_HOURS: Record<string, number> = {
  "De 4 em 4 horas": 4,
  "De 6 em 6 horas": 6,
  "De 8 em 8 horas": 8,
  "De 12 em 12 horas": 12,
};

function getMedicationId(medication: any): string | number | null {
  return (
    medication?.id ||
    medication?.id_medicacoes ||
    medication?.uuid ||
    medication?.medicationId ||
    medication?.idMedicacao ||
    null
  );
}

function isValidMedicationId(value: any): boolean {
  return Boolean(value) && value !== "undefined" && value !== "null";
}

function parseMedicationDate(value?: string | Date | null): Date {
  if (!value) {
    const fallback = new Date();
    fallback.setHours(12, 0, 0, 0);
    return fallback;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      const fallback = new Date();
      fallback.setHours(12, 0, 0, 0);
      return fallback;
    }

    const date = new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12,
      0,
      0,
      0,
    );

    return date;
  }

  const text = String(value).trim();

  if (!text) {
    const fallback = new Date();
    fallback.setHours(12, 0, 0, 0);
    return fallback;
  }

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    fallback.setHours(12, 0, 0, 0);
    return fallback;
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    12,
    0,
    0,
    0,
  );
}

function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeTime(time: string): string | null {
  if (!time) return null;

  const trimmed = String(time).trim();

  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function splitMedicationTimes(value?: string | null): string[] {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((time) => normalizeTime(time))
    .filter(Boolean) as string[];
}

const getTimesForFrequency = (
  frequency: string,
  startTime: string,
): string[] => {
  const normalizedStartTime = normalizeTime(startTime) || "08:00";

  const interval = INTERVAL_HOURS[frequency];

  if (interval) {
    const [startH, startM] = normalizedStartTime.split(":").map(Number);
    const count = 24 / interval;

    return Array.from({ length: count }, (_, i) => {
      const totalMinutes = startH * 60 + startM + i * interval * 60;
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;

      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    });
  }

  if (frequency === "Uso único" || frequency === "1 vez ao dia") {
    return [normalizedStartTime];
  }

  return [normalizedStartTime];
};

export function useMedicationForm(onSuccess?: () => void) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [medicationName, setMedicationName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [isContinuous, setIsContinuous] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState("08:00");
  const [alertTimes, setAlertTimes] = useState(["08:00"]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null);
  const [showFreqModal, setShowFreqModal] = useState(false);

  const editLoadFreq = useRef("");
  const editLoadStartTime = useRef("");
  const isLoadingEdit = useRef(false);

  useEffect(() => {
    if (frequency === "Uso único") {
      setIsContinuous(false);
      setEndDate(startDate);
    }

    if (isLoadingEdit.current) {
      isLoadingEdit.current = false;
      return;
    }

    if (
      editingId &&
      frequency === editLoadFreq.current &&
      startTime === editLoadStartTime.current
    ) {
      return;
    }

    if (frequency) {
      setAlertTimes(getTimesForFrequency(frequency, startTime));
    }
  }, [frequency, startTime, startDate, editingId]);

  const toggleForm = () => {
    if (isFormVisible) {
      resetForm();
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsFormVisible(true);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setMedicationName("");
    setFrequency("");
    setIsContinuous(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime("08:00");
    setAlertTimes(["08:00"]);
    setNotificationsEnabled(true);

    editLoadFreq.current = "";
    editLoadStartTime.current = "";
    isLoadingEdit.current = false;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormVisible(false);
  };

  const handleEditPress = (medication: any) => {
    isLoadingEdit.current = true;

    const medicationId = getMedicationId(medication);

    setEditingId(medicationId);
    setMedicationName(medication.nome || medication.medicationName || "");

    const freq = medication.frequencia || medication.frequency || "";
    setFrequency(freq);
    editLoadFreq.current = freq;

    const startDateString =
      medication.periodo_inicio ||
      medication.data_inicio ||
      medication.inicio ||
      medication.startDate;

    const endDateString =
      medication.periodo_fim ||
      medication.data_fim ||
      medication.fim ||
      medication.endDate;

    const dInicio = parseMedicationDate(startDateString);
    const dFim = endDateString
      ? parseMedicationDate(endDateString)
      : new Date();

    setStartDate(dInicio);
    setEndDate(dFim);

    const flagContinuo =
      medication.continuo === true ||
      medication.continuo === "true" ||
      medication.isContinuous === true ||
      medication.is_continuous === true ||
      medication.uso_continuo === true ||
      medication.uso_continuo === "true" ||
      (!endDateString && freq !== "Uso único");

    setIsContinuous(flagContinuo);

    let sTime = "08:00";

    if (medication.horario_inicio) {
      sTime = normalizeTime(medication.horario_inicio) || "08:00";
    } else if (medication.horarios) {
      const times = splitMedicationTimes(medication.horarios);
      sTime = times[0] || "08:00";
    }

    setStartTime(sTime);
    editLoadStartTime.current = sTime;

    if (medication.horarios) {
      const times = splitMedicationTimes(medication.horarios);
      setAlertTimes(times.length ? times : getTimesForFrequency(freq, sTime));
    } else {
      setAlertTimes(getTimesForFrequency(freq, sTime));
    }

    setNotificationsEnabled(
      medication.notificacao_alerta === "true" ||
        medication.notificacao_alerta === true ||
        medication.notificacao_alerta === undefined ||
        medication.notificacao_alerta === null,
    );

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormVisible(true);
  };

  const formatDateBR = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAddTime = () => {
    setEditingTimeIndex(null);
    setPickerDate(new Date());
    setShowTimePicker(true);
  };

  const handleEditTime = (index: number) => {
    setEditingTimeIndex(index);

    const [hours, minutes] = alertTimes[index].split(":").map(Number);

    const d = new Date();
    d.setHours(hours, minutes, 0, 0);

    setPickerDate(d);
    setShowTimePicker(true);
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setAlertTimes((prev) => prev.filter((time) => time !== timeToRemove));
  };

  const handleTimeConfirm = (selectedDate: Date) => {
    const formattedTime = `${String(selectedDate.getHours()).padStart(
      2,
      "0",
    )}:${String(selectedDate.getMinutes()).padStart(2, "0")}`;

    if (editingTimeIndex !== null) {
      const newTimes = [...alertTimes];
      newTimes[editingTimeIndex] = formattedTime;

      setAlertTimes([...new Set(newTimes)].sort());
    } else if (!alertTimes.includes(formattedTime)) {
      setAlertTimes([...alertTimes, formattedTime].sort());
    }

    setShowTimePicker(false);
    setEditingTimeIndex(null);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setEditingTimeIndex(null);
  };

  const handleSave = async () => {
    if (!medicationName.trim()) {
      Alert.alert("Aviso", "Digite o nome da medicação.");
      return;
    }

    if (!frequency) {
      Alert.alert("Aviso", "Selecione a frequência.");
      return;
    }

    const cleanedAlertTimes = alertTimes
      .map((time) => normalizeTime(time))
      .filter(Boolean) as string[];

    if (!cleanedAlertTimes.length) {
      Alert.alert("Aviso", "Adicione pelo menos um horário.");
      return;
    }

    setIsSaving(true);

    try {
      const dataInicioAPI = formatDateToYMD(startDate);

      const dataFimAPI =
        frequency === "Uso único" || isContinuous
          ? undefined
          : formatDateToYMD(endDate);

      const payload = {
        nome: medicationName.trim(),
        frequencia: frequency,
        continuo: frequency === "Uso único" ? false : isContinuous,
        periodo_inicio: dataInicioAPI,
        periodo_fim: dataFimAPI,
        horarios: cleanedAlertTimes.join(", "),
        horario_inicio: normalizeTime(startTime) || cleanedAlertTimes[0],
        notificacao_alerta: notificationsEnabled ? "true" : "false",
      };

      let response;
      let targetMedId: string | number | null = null;

      if (editingId) {
        response = await medicationsService.updateMedication(
          editingId,
          payload,
        );
        targetMedId = editingId;
      } else {
        response = await medicationsService.saveMedication(payload);
        targetMedId = getMedicationId(response.data);
      }

      if (!response.success) {
        Alert.alert("Erro", "Não foi possível salvar.");
        return;
      }

      if (!isValidMedicationId(targetMedId)) {
        console.warn(
          "Medicação salva, mas a API não retornou ID. As notificações serão reagendadas no próximo fetch.",
          response.data,
        );

        Alert.alert(
          "Sucesso",
          editingId ? "Medicação atualizada!" : "Medicação adicionada!",
        );

        resetForm();
        onSuccess?.();
        return;
      }

      if (!notificationsEnabled) {
        await cancelAllMedicationNotifications(targetMedId as string | number);

        Alert.alert(
          "Sucesso",
          editingId ? "Medicação atualizada!" : "Medicação adicionada!",
        );

        resetForm();
        onSuccess?.();
        return;
      }

      await cancelMedicationNotifications(targetMedId as string | number);

      const userRes = await profileService.getMe();
      const user = userRes.data;

      const isPaciente =
        user?.tipo_usuario?.toLowerCase() === "paciente" ||
        user?.tipo?.toLowerCase() === "paciente" ||
        user?.role?.toLowerCase() === "paciente" ||
        user?.perfil?.toLowerCase() === "paciente";

      const isGlobalOn = user?.notif_medicacoes !== false;
      const isLocalOn = notificationsEnabled;

      if (isPaciente && isGlobalOn && isLocalOn) {
        let endDateForSchedule: Date | null = null;

        if (frequency === "Uso único") {
          endDateForSchedule = new Date(startDate);
          endDateForSchedule.setHours(23, 59, 59, 999);
        } else if (!isContinuous) {
          endDateForSchedule = endDate;
          endDateForSchedule.setHours(23, 59, 59, 999);
        }

        await scheduleMedicationDoses(
          targetMedId as string | number,
          medicationName.trim(),
          cleanedAlertTimes,
          startDate,
          endDateForSchedule,
          7,
        );
      }

      Alert.alert(
        "Sucesso",
        editingId ? "Medicação atualizada!" : "Medicação adicionada!",
      );

      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao salvar medicação:", error);
      Alert.alert("Erro", "Problema de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isFormVisible,
    isSaving,
    editingId,
    medicationName,
    frequency,
    isContinuous,
    startDate,
    endDate,
    startTime,
    alertTimes,
    notificationsEnabled,
    showTimePicker,
    showStartTimePicker,
    pickerDate,
    showFreqModal,
    setMedicationName,
    setFrequency,
    setIsContinuous,
    setStartDate,
    setEndDate,
    setStartTime,
    setShowStartTimePicker,
    setNotificationsEnabled,
    setShowFreqModal,
    toggleForm,
    resetForm,
    handleEditPress,
    formatDateBR,
    handleAddTime,
    handleEditTime,
    handleRemoveTime,
    handleTimeConfirm,
    handleTimeCancel,
    handleSave,
  };
}
