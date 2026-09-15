import { BannerSlot } from "@/components/banners/BannerSlot";
import { AddButtonPill } from "@/components/common/AddButtonPill";
import { Header } from "@/components/common/Header";
import { CalendarStrip } from "@/components/consultations/CalendarStrip";
import { ConsultationCard } from "@/components/consultations/ConsultationCard";
import { ConsultationModal } from "@/components/consultations/ConsultationModal";
import { DateTimePickers } from "@/components/consultations/DateTimePickers";
import { EmptyConsultations } from "@/components/consultations/EmptyConsultations";
import { MasterCalendarModal } from "@/components/consultations/MasterCalendarModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCalendar } from "@/hooks/consultattions/useCalendar";
import { useConsultationCRUD } from "@/hooks/consultattions/useConsultationCRUD";
import { profileService } from "@/services/profile/profileService";
import { Redirect, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

const TAB_BAR_CLEARANCE = Platform.OS === "ios" ? 130 : 110;
// Altura aproximada do banner (335x90, ver constants/bannerTamanhos.ts) 
const BANNER_CLEARANCE = 110;

function getConsultationId(consultation: any) {
  return (
    consultation?.id_consulta ||
    consultation?.id_agenda ||
    consultation?.id ||
    consultation?.uuid ||
    consultation?.consultationId ||
    `${consultation?.data}-${consultation?.horario}-${consultation?.nome}`
  );
}

function getConsultationDate(consultation: any): string {
  return (
    consultation?.data ||
    consultation?.data_consulta ||
    consultation?.date ||
    consultation?.consultationDate ||
    ""
  );
}

function getConsultationTime(consultation: any): string {
  return (
    consultation?.horario ||
    consultation?.hora ||
    consultation?.hora_consulta ||
    consultation?.time ||
    consultation?.consultationTime ||
    "00:00"
  );
}

export default function ConsultationsScreen() {
  const { role } = useAuth();
  const { selectedDate, setSelectedDate, monthYear, days } = useCalendar();

  const [globalNotifEnabled, setGlobalNotifEnabled] = useState(true);

  const {
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
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
  } = useConsultationCRUD(globalNotifEnabled);

  const hoje = new Date();
  const anoHoje = hoje.getFullYear();
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
  const diaHoje = String(hoje.getDate()).padStart(2, "0");
  const hojeString = `${anoHoje}-${mesHoje}-${diaHoje}`;

  useFocusEffect(
    useCallback(() => {
      const fetchGlobalPrefs = async () => {
        try {
          const response = await profileService.getMe();

          if (response.success && response.data) {
            setGlobalNotifEnabled(response.data.notif_consultas ?? true);
          }
        } catch (error) {
          console.error("Erro ao buscar preferências globais", error);
        }
      };

      fetchGlobalPrefs();
    }, []),
  );

  const filteredConsultations = allConsultations
    .filter((consultation) => {
      const date = getConsultationDate(consultation);
      return date >= hojeString;
    })
    .sort((a, b) => {
      const dataA = getConsultationDate(a);
      const dataB = getConsultationDate(b);

      if (dataA !== dataB) {
        return dataA.localeCompare(dataB);
      }

      const horaA = getConsultationTime(a);
      const horaB = getConsultationTime(b);

      return horaA.localeCompare(horaB);
    });

  if (role === "especialista") {
    return <Redirect href="/(app)/chat" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minha Agenda" showBackButton={false} />

      <CalendarStrip
        monthYear={monthYear}
        days={days}
        selectedDate={String(selectedDate.getDate()).padStart(2, "0")}
        onSelectDate={(diaClicadoNum) => {
          const diaEncontrado = days.find((d) => d.dayNum === diaClicadoNum);

          if (diaEncontrado) {
            setSelectedDate(diaEncontrado.fullDate);
          }
        }}
        onCalendarPress={() => setShowMasterCalendar(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.consultationsList}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Compromissos</Text>
          <AddButtonPill
            label="Nova"
            onPress={() => openCreateModal(selectedDate)}
          />
        </View>

        {isLoadingAPI ? (
          <ActivityIndicator
            size="large"
            color={PRIMARY_BLUE}
            style={{ marginTop: 40 }}
          />
        ) : filteredConsultations.length === 0 ? (
          <EmptyConsultations
            title="Agenda livre"
            message="Você não possui nenhum compromisso agendado daqui para frente."
          />
        ) : (
          filteredConsultations.map((consultation) => (
            <ConsultationCard
              key={String(getConsultationId(consultation))}
              consultation={consultation}
              onPress={() => openEditModal(consultation)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.bannerContainer}>
        <BannerSlot local="consultas_mobile" publicoAlvo={role ?? undefined} />
      </View>

      <MasterCalendarModal
        visible={showMasterCalendar}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onClose={() => setShowMasterCalendar(false)}
      />

      <ConsultationModal
        visible={isModalVisible}
        isEditing={!!editingId}
        isSaving={isSaving}
        nome={nomeConsulta}
        dataConsulta={dataConsulta}
        horaConsulta={horaConsulta}
        notificacaoAtiva={notificacaoAtiva}
        globalNotifEnabled={globalNotifEnabled}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSave}
        onDelete={editingId ? handleDelete : undefined}
        onNomeChange={setNomeConsulta}
        onDataPress={() => setShowDatePicker(true)}
        onHoraPress={() => setShowTimePicker(true)}
        onNotificacaoChange={(valor) => setNotificacaoAtiva(valor)}
      >
        <DateTimePickers
          showDatePicker={showDatePicker}
          showTimePicker={showTimePicker}
          dateValue={dataConsulta}
          timeValue={horaConsulta}
          onDateChange={setDataConsulta}
          onTimeChange={setHoraConsulta}
          onCloseDatePicker={() => setShowDatePicker(false)}
          onCloseTimePicker={() => setShowTimePicker(false)}
        />
      </ConsultationModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  consultationsList: {
    padding: 20,
    paddingBottom: TAB_BAR_CLEARANCE + BANNER_CLEARANCE,
  },
  bannerContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: TAB_BAR_CLEARANCE,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: DARK_TEXT,
  },
});
