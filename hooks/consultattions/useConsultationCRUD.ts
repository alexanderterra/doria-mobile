import { useAuth } from "@/contexts/AuthContext";
import { agendaService } from "@/services/agenda/agendaService";
import {
  cancelConsultationNotifications,
  scheduleConsultationNotifications,
} from "@/services/notifications/consultationsNotifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

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

function getUserId(user: any): string | number | undefined {
  const id =
    user?.id_usuario || user?.id || user?.uuid || user?.user_id || user?.idUser;

  return id ? String(id) : undefined;
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

function formatDateToYMD(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatTimeToHM(date: Date): string {
  const horas = String(date.getHours()).padStart(2, "0");
  const minutos = String(date.getMinutes()).padStart(2, "0");

  return `${horas}:${minutos}`;
}

function parseConsultationDate(value?: string | Date | null): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
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
      const ano = Number(match[1]);
      const mes = Number(match[2]);
      const dia = Number(match[3]);

      return new Date(ano, mes - 1, dia, 12, 0, 0, 0);
    }
  }

  const fallback = new Date();
  fallback.setHours(12, 0, 0, 0);
  return fallback;
}

function parseConsultationTime(value?: string | Date | null): Date {
  const date = new Date();

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    date.setHours(value.getHours(), value.getMinutes(), 0, 0);
    return date;
  }

  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);

    if (match) {
      const horas = Number(match[1]);
      const minutos = Number(match[2]);

      if (
        !Number.isNaN(horas) &&
        !Number.isNaN(minutos) &&
        horas >= 0 &&
        horas <= 23 &&
        minutos >= 0 &&
        minutos <= 59
      ) {
        date.setHours(horas, minutos, 0, 0);
        return date;
      }
    }
  }

  date.setHours(9, 0, 0, 0);
  return date;
}

export function useConsultationCRUD(globalNotifEnabled: boolean = true) {
  const { user } = useAuth();

  const [allConsultations, setAllConsultations] = useState<any[]>([]);
  const [isLoadingAPI, setIsLoadingAPI] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [nomeConsulta, setNomeConsulta] = useState("");
  const [dataConsulta, setDataConsulta] = useState(new Date());
  const [horaConsulta, setHoraConsulta] = useState(new Date());
  const [notificacaoAtiva, setNotificacaoAtiva] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMasterCalendar, setShowMasterCalendar] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setNomeConsulta("");
    setDataConsulta(new Date());
    setHoraConsulta(new Date());
    setNotificacaoAtiva(true);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const fetchAgenda = async () => {
    setIsLoadingAPI(true);

    try {
      const res = await agendaService.getAgenda();

      if (res.success && Array.isArray(res.data)) {
        setAllConsultations([...res.data].reverse());
      } else {
        setAllConsultations([]);
      }
    } catch (error) {
      console.error("Erro ao buscar agenda:", error);
      setAllConsultations([]);
    } finally {
      setIsLoadingAPI(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAgenda();
    }, []),
  );

  const openCreateModal = (defaultDate?: Date) => {
    const horaInicial = new Date();
    horaInicial.setSeconds(0, 0);

    setEditingId(null);
    setNomeConsulta("");
    setDataConsulta(defaultDate || new Date());
    setHoraConsulta(horaInicial);
    setNotificacaoAtiva(true);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsModalVisible(true);
  };

  const openEditModal = (item: any) => {
    const id = getConsultationId(item);

    if (!id) {
      Alert.alert("Erro", "Identificador da consulta não encontrado.");
      return;
    }

    const nome = item.nome || item.title || item.titulo || "Consulta";

    const dataRaw =
      item.data ||
      item.data_consulta ||
      item.date ||
      item.consultationDate ||
      null;

    const horarioRaw =
      item.horario ||
      item.hora ||
      item.hora_consulta ||
      item.time ||
      item.consultationTime ||
      "09:00";

    setEditingId(id);
    setNomeConsulta(nome);
    setDataConsulta(parseConsultationDate(dataRaw));
    setHoraConsulta(parseConsultationTime(horarioRaw));

    setNotificacaoAtiva(
      isTruthyNotificationValue(
        item.notificacao ??
          item.notificacao_ativa ??
          item.notification ??
          item.notificacaoAtiva,
      ),
    );

    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!nomeConsulta.trim()) {
      Alert.alert("Aviso", "Digite o nome da consulta/médico.");
      return;
    }

    setIsSaving(true);

    try {
      const dataFormatada = formatDateToYMD(dataConsulta);
      const horaFormatada = formatTimeToHM(horaConsulta);

      const payload = {
        nome: nomeConsulta.trim(),
        data: dataFormatada,
        horario: horaFormatada,
        notificacao: notificacaoAtiva ? "true" : "false",
      };

      const userId = getUserId(user);

      if (editingId) {
        const res = await agendaService.updateAgendaItem(editingId, payload);

        if (!res.success) {
          Alert.alert(
            "Erro do Servidor",
            res.message || "Erro ao atualizar consulta.",
          );
          return;
        }

        if (globalNotifEnabled && notificacaoAtiva) {
          await scheduleConsultationNotifications(
            editingId,
            nomeConsulta.trim(),
            dataConsulta,
            horaConsulta,
            userId,
          );
        } else {
          await cancelConsultationNotifications(editingId);
        }

        setAllConsultations((prev) =>
          prev.map((c) => {
            const currentId = getConsultationId(c);

            if (String(currentId) !== String(editingId)) {
              return c;
            }

            return {
              ...c,
              id: c.id || editingId,
              id_consulta: c.id_consulta || editingId,
              nome: nomeConsulta.trim(),
              data: dataFormatada,
              horario: horaFormatada,
              notificacao: notificacaoAtiva ? "true" : "false",
            };
          }),
        );

        setIsModalVisible(false);
        resetForm();
        return;
      }

      const res = await agendaService.saveAgendaItem(payload);

      if (!res.success || !res.data) {
        Alert.alert("Erro do Servidor", res.message || "Erro ao salvar.");
        return;
      }

      const savedItem = res.data?.agenda || res.data?.consulta || res.data;
      const newId = getConsultationId(savedItem);

      if (!newId) {
        console.warn("Consulta salva, mas sem ID retornado:", res.data);
      }

      if (newId && globalNotifEnabled && notificacaoAtiva) {
        await scheduleConsultationNotifications(
          newId,
          nomeConsulta.trim(),
          dataConsulta,
          horaConsulta,
          userId,
        );
      }

      const novaConsultaProFront = {
        ...savedItem,
        id: newId,
        id_consulta: savedItem?.id_consulta || newId,
        nome: nomeConsulta.trim(),
        data: dataFormatada,
        horario: horaFormatada,
        notificacao: notificacaoAtiva ? "true" : "false",
      };

      setAllConsultations((prev) => [novaConsultaProFront, ...prev]);
      setIsModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar consulta:", error);
      Alert.alert("Erro", "Falha na conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;

    Alert.alert("Cancelar Consulta", "Tem certeza que deseja cancelar?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sim, cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            const idToDelete = editingId;

            const res = await agendaService.deleteAgendaItem(idToDelete);

            if (!res.success) {
              Alert.alert(
                "Erro",
                res.message || "Não foi possível cancelar a consulta.",
              );
              return;
            }

            await cancelConsultationNotifications(idToDelete);

            setAllConsultations((prev) =>
              prev.filter((c) => {
                const currentId = getConsultationId(c);
                return String(currentId) !== String(idToDelete);
              }),
            );

            setIsModalVisible(false);
            resetForm();
          } catch (error) {
            console.error("Erro ao cancelar consulta:", error);
            Alert.alert("Erro", "Falha ao cancelar consulta.");
          }
        },
      },
    ]);
  };

  return {
    allConsultations,
    isLoadingAPI,
    isSaving,
    isModalVisible,
    setIsModalVisible,
    editingId,
    nomeConsulta,
    setNomeConsulta,
    dataConsulta,
    setDataConsulta,
    horaConsulta,
    setHoraConsulta,
    notificacaoAtiva,
    setNotificacaoAtiva,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    showMasterCalendar,
    setShowMasterCalendar,
    fetchAgenda,
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
  };
}
