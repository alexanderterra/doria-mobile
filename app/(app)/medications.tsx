import { BannerSlot } from "@/components/banners/BannerSlot";
import { AddButtonPill } from "@/components/common/AddButtonPill";
import { Header } from "@/components/common/Header";
import { ContinuousUseToggle } from "@/components/medications/ContinuousUseToggle";
import { FrequencyModal } from "@/components/medications/FrequencyModal";
import { FrequencyRow } from "@/components/medications/FrequencyRow";
import { MedicationForm } from "@/components/medications/MedicationForm";
import { MedicationFormModal } from "@/components/medications/MedicationFormModal";
import { MedicationList } from "@/components/medications/MedicationList";
import { NotificationToggle } from "@/components/medications/NotificationTogle";
import { TimePickerModal } from "@/components/medications/TimePickerModal";
import { TimePillsInput } from "@/components/medications/TimePillsInput";
import { TreatmentPeriodCard } from "@/components/medications/TreatmentPeriodCard";
import { TreatmentStartTimeRow } from "@/components/medications/TreatmentStartTimeRow";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicationForm } from "@/hooks/medication/useMedicationForm";
import { useMedications } from "@/hooks/medication/useMedications";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

const TAB_BAR_CLEARANCE = Platform.OS === "ios" ? 130 : 110;
const BANNER_CLEARANCE = 110;

const FREQUENCIES = [
  "Uso único",
  "De 4 em 4 horas",
  "De 6 em 6 horas",
  "De 8 em 8 horas",
  "De 12 em 12 horas",
  "1 vez ao dia",
];

const INTERVAL_FREQUENCIES = [
  "De 4 em 4 horas",
  "De 6 em 6 horas",
  "De 8 em 8 horas",
  "De 12 em 12 horas",
];

function isContinuousMedication(med: any) {
  return (
    med.continuo === true ||
    med.continuo === "true" ||
    med.isContinuous === true ||
    med.is_continuous === true ||
    med.uso_continuo === true
  );
}

function getLocalDate(dateString?: string | null) {
  if (!dateString || dateString.includes("2099")) return null;

  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export default function MedicationsScreen() {
  const { role } = useAuth();
  const { medications, isLoading, fetchMedications, deleteMedication } =
    useMedications();

  const form = useMedicationForm(() => {
    fetchMedications();
  });

  const [showFormModal, setShowFormModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleAddPress = () => {
    form.resetForm();
    setShowFormModal(true);
  };

  const getMedicationId = (med: any) =>
    med.id ||
    med.id_medicacoes ||
    med.uuid ||
    med.medicationId ||
    med.idMedicacao;

  const handleEditPress = (id: string | number) => {
    const medToEdit = medications.find(
      (m: any) => String(getMedicationId(m)) === String(id),
    );

    if (medToEdit) {
      form.handleEditPress(medToEdit);
      setShowFormModal(true);
    } else {
      console.warn("Medicação não encontrada para edição:", {
        id,
        medicationsIds: medications.map((m: any) => getMedicationId(m)),
      });
    }
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
  };

  const handleSaveWithClose = async () => {
    await form.handleSave();
    setShowFormModal(false);
  };

  const handleDeleteFromModal = () => {
    if (form.editingId) {
      setShowFormModal(false);
      deleteMedication(form.editingId as string | number);
    }
  };

  const startTimeAsDate = (() => {
    const [h, m] = form.startTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  })();

  const activeMedications = medications.filter((med: any) => {
    if (isContinuousMedication(med)) {
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDateString =
      med.periodo_fim || med.endDate || med.data_fim || med.fim;

    if (endDateString) {
      const endDate = getLocalDate(endDateString);
      if (endDate) return endDate.getTime() >= today.getTime();
    }

    const frequency = med.frequency || med.frequencia;

    const startDateString =
      med.periodo_inicio || med.startDate || med.data_inicio || med.inicio;

    if (frequency === "Uso único" && startDateString) {
      const startDate = getLocalDate(startDateString);
      if (startDate) return startDate.getTime() >= today.getTime();
    }

    return true;
  });

  if (role === "especialista") {
    return <Redirect href="/(app)/chat" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Medicações" showBackButton={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.medicationsList}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Medicações</Text>
          <AddButtonPill label="Nova" onPress={handleAddPress} />
        </View>

        <MedicationList
          medications={activeMedications}
          isLoading={isLoading}
          onReminderPress={handleEditPress}
          onDeletePress={deleteMedication}
        />
      </ScrollView>

      <View style={styles.bannerContainer}>
        <BannerSlot local="medicacoes_mobile" publicoAlvo={role ?? undefined} />
      </View>

      <MedicationFormModal
        visible={showFormModal}
        onClose={handleCloseModal}
        onSave={handleSaveWithClose}
        isSaving={form.isSaving}
        editingId={form.editingId}
        onDelete={form.editingId ? handleDeleteFromModal : undefined}
      >
        <MedicationForm
          medicationName={form.medicationName}
          onChangeMedicationName={form.setMedicationName}
        />

        <FrequencyRow
          frequency={form.frequency}
          onFrequencyPress={() => form.setShowFreqModal(true)}
        />

        {form.frequency === "Uso único" ? (
          <View style={styles.singleDateWrapper}>
            <Text style={styles.singleDateLabel}>Data da medicação</Text>
            <TouchableOpacity
              style={styles.singleDateBox}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Feather name="calendar" size={18} color={PRIMARY_BLUE} />
              <Text style={styles.singleDateText}>
                {form.formatDateBR(form.startDate)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ContinuousUseToggle
              isContinuous={form.isContinuous}
              onToggle={form.setIsContinuous}
            />

            {!form.isContinuous && (
              <TreatmentPeriodCard
                startDate={form.formatDateBR(form.startDate)}
                endDate={form.formatDateBR(form.endDate)}
                onStartDatePress={() => setShowStartDatePicker(true)}
                onEndDatePress={() => setShowEndDatePicker(true)}
              />
            )}
          </>
        )}

        {INTERVAL_FREQUENCIES.includes(form.frequency) && (
          <TreatmentStartTimeRow
            time={form.startTime}
            onPress={() => form.setShowStartTimePicker(true)}
          />
        )}

        <TimePillsInput
          times={form.alertTimes}
          onAddTime={form.handleAddTime}
          onRemoveTime={form.handleRemoveTime}
          onEditTime={form.handleEditTime}
        />

        <NotificationToggle
          enabled={form.notificationsEnabled}
          onToggle={form.setNotificationsEnabled}
        />
      </MedicationFormModal>

      {/* Modal de Frequência */}
      <FrequencyModal
        visible={form.showFreqModal}
        selectedFrequency={form.frequency}
        frequencies={FREQUENCIES}
        onSelect={(freq) => {
          form.setFrequency(freq);
          form.setShowFreqModal(false);
        }}
        onClose={() => form.setShowFreqModal(false)}
      />

      <TimePickerModal
        visible={form.showTimePicker}
        initialDate={form.pickerDate}
        onConfirm={form.handleTimeConfirm}
        onCancel={form.handleTimeCancel}
      />

      <TimePickerModal
        visible={form.showStartTimePicker}
        initialDate={startTimeAsDate}
        title="Horário de início"
        onConfirm={(date) => {
          const h = String(date.getHours()).padStart(2, "0");
          const m = String(date.getMinutes()).padStart(2, "0");
          form.setStartTime(`${h}:${m}`);
          form.setShowStartTimePicker(false);
        }}
        onCancel={() => form.setShowStartTimePicker(false)}
      />

      {showStartDatePicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.masterCalendarOverlay}>
            <View style={styles.masterCalendarPopup}>
              <View style={styles.masterCalendarHeader}>
                <Text style={styles.masterCalendarTitle}>
                  {form.frequency === "Uso único"
                    ? "Data da Medicação"
                    : "Data de Início"}
                </Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                  <Text style={styles.masterCalendarCloseText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={form.startDate}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  style={{ width: 320, alignSelf: "center" }}
                  locale="pt-BR"
                  onChange={(e, date) => {
                    if (date) form.setStartDate(date);
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={form.startDate}
            mode="date"
            display="calendar"
            onChange={(e, date) => {
              setShowStartDatePicker(false);
              if (e.type !== "dismissed" && date) {
                form.setStartDate(date);
              }
            }}
          />
        ))}

      {showEndDatePicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.masterCalendarOverlay}>
            <View style={styles.masterCalendarPopup}>
              <View style={styles.masterCalendarHeader}>
                <Text style={styles.masterCalendarTitle}>Data Final</Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                  <Text style={styles.masterCalendarCloseText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={form.endDate}
                  mode="date"
                  minimumDate={form.startDate}
                  display="inline"
                  themeVariant="light"
                  style={{ width: 320, alignSelf: "center" }}
                  locale="pt-BR"
                  onChange={(e, date) => {
                    if (date) form.setEndDate(date);
                  }}
                />
              </View>
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={form.endDate}
            mode="date"
            minimumDate={form.startDate}
            display="calendar"
            onChange={(e, date) => {
              setShowEndDatePicker(false);
              if (e.type !== "dismissed" && date) {
                form.setEndDate(date);
              }
            }}
          />
        ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  medicationsList: {
    padding: 20,
    paddingBottom: TAB_BAR_CLEARANCE + BANNER_CLEARANCE,
  },
  bannerContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: TAB_BAR_CLEARANCE,
  },
  banner: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_TEXT,
  },
  singleDateWrapper: {
    marginBottom: 20,
    marginTop: 8,
  },
  singleDateLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
  },
  singleDateBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
  },
  singleDateText: {
    fontSize: 16,
    color: DARK_TEXT,
    fontWeight: "500",
  },
  masterCalendarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  masterCalendarPopup: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    width: "90%",
    maxWidth: 360,
  },
  masterCalendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
    marginBottom: 16,
  },
  masterCalendarTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_TEXT,
  },
  masterCalendarCloseText: {
    color: PRIMARY_BLUE,
    fontSize: 16,
    fontWeight: "700",
  },
  pickerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
