import { Header } from "@/components/common/Header";
import { FilterModal } from "@/components/diary/FilterModal";
import { HistoryList } from "@/components/diary/HistoryList";
import { PainEntryForm } from "@/components/diary/PainelEntryForm";
import { ReportPreviewModal } from "@/components/profile/ReportPreviewModal";
import { ReportTermsModal } from "@/components/profile/ReportTermsModal";
import { useAuth } from "@/contexts/AuthContext";
import { useDiaryEntries } from "@/hooks/diary/useDiaryEntries";
import { useDiaryExport } from "@/hooks/diary/useDiaryExport";
import { useDiaryFilters } from "@/hooks/diary/useDiaryFilters";
import { Feather } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";

export default function DiaryScreen() {
  const insets = useSafeAreaInsets();

  const { user, role } = useAuth();

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const {
    history,
    isLoadingHistory,
    isSaving,
    painLevel,
    setPainLevel,
    sleepLevel,
    setSleepLevel,
    anxietyLevel,
    setAnxietyLevel,
    note,
    setNote,
    editingId,
    handleEditPress,
    handleCancelEdit,
    handleSave,
  } = useDiaryEntries();

  const {
    activeFilter,
    setActiveFilter,
    selectedMonthDate,
    setSelectedMonthDate,
    filteredHistory,
    getFilterTitle,
  } = useDiaryFilters(history);

  const { isExporting, exportToPDF } = useDiaryExport();

  const handleSaveWithFilterReset = () => {
    handleSave(() => {
      if (activeFilter !== "ultimos_7_cards" && activeFilter !== "todos") {
        setActiveFilter("ultimos_7_cards");
      }
    });
  };

  const handleSelectFilter = (filter: typeof activeFilter, date?: Date) => {
    setActiveFilter(filter);
    if (date) setSelectedMonthDate(date);
  };

  const handleStartReportFlow = () => {
    if (filteredHistory.length === 0) {
      Alert.alert("Aviso", "Não há registros neste filtro para exportar.");
      return;
    }
    setIsTermsVisible(true);
  };

  const handleAcceptTerms = () => {
    setIsTermsVisible(false);
    setTimeout(() => {
      setIsPreviewVisible(true);
    }, 400);
  };

  const handleExportFinalPDF = () => {
    const nomeDoUsuario =
      user?.nome || user?.name || user?.username || "Paciente";
    exportToPDF(filteredHistory, nomeDoUsuario);
  };

  if (role === "especialista") {
    return <Redirect href="/(app)/chat" />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Header title="Minha Jornada" showBackButton={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <PainEntryForm
            painLevel={painLevel}
            sleepLevel={sleepLevel}
            anxietyLevel={anxietyLevel}
            note={note}
            isSaving={isSaving}
            onSelectPainLevel={setPainLevel}
            onSelectSleepLevel={setSleepLevel}
            onSelectAnxietyLevel={setAnxietyLevel}
            onChangeNote={setNote}
            onSave={handleSaveWithFilterReset}
            isEditing={!!editingId}
            onCancelEdit={handleCancelEdit}
          />

          <View style={styles.listHeaderContainer}>
            <Text style={styles.listTitle}>{getFilterTitle()}</Text>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                onPress={handleStartReportFlow}
                style={styles.iconButton}
                disabled={isExporting || isLoadingHistory}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={PRIMARY_BLUE} />
                ) : (
                  <Feather name="send" size={20} color={PRIMARY_BLUE} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(true)}
                style={[
                  styles.iconButton,
                  activeFilter !== "ultimos_7_cards" && {
                    borderColor: PRIMARY_BLUE,
                    backgroundColor: "#EFF6FF",
                  },
                ]}
              >
                <Feather
                  name="filter"
                  size={20}
                  color={
                    activeFilter !== "ultimos_7_cards"
                      ? PRIMARY_BLUE
                      : "#64748B"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {isLoadingHistory ? (
            <ActivityIndicator
              size="small"
              color={PRIMARY_BLUE}
              style={{ marginTop: 20 }}
            />
          ) : (
            <HistoryList
              entries={filteredHistory}
              onFilterPress={() => setIsFilterModalVisible(true)}
              onEditPress={handleEditPress}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <FilterModal
        visible={isFilterModalVisible}
        activeFilter={activeFilter}
        selectedMonthDate={selectedMonthDate}
        onClose={() => setIsFilterModalVisible(false)}
        onSelectFilter={handleSelectFilter}
      />

      <ReportTermsModal
        visible={isTermsVisible}
        onClose={() => setIsTermsVisible(false)}
        onAccept={handleAcceptTerms}
      />

      <ReportPreviewModal
        visible={isPreviewVisible}
        data={filteredHistory}
        isExporting={isExporting}
        onClose={() => setIsPreviewVisible(false)}
        onExport={handleExportFinalPDF}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
  listHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  listTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  actionButtonsRow: { flexDirection: "row", gap: 12 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});
