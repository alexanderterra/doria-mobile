import { EvolutionFilterType } from "@/hooks/evolution/useEvolution";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";

interface EvolutionFilterModalProps {
  visible: boolean;
  activeFilter: EvolutionFilterType;
  selectedMonthDate: Date;
  onClose: () => void;
  onSelectFilter: (filter: EvolutionFilterType, date?: Date) => void;
}

export function EvolutionFilterModal({
  visible,
  activeFilter,
  selectedMonthDate,
  onClose,
  onSelectFilter,
}: EvolutionFilterModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(selectedMonthDate);

  const handleSelectMonth = (date: Date) => {
    setTempDate(date);
    onSelectFilter("mes_especifico", date);
    setShowDatePicker(false);
    onClose();
  };

  const renderFilterOptions = () => (
    <>
      <Text style={styles.modalTitle}>Filtrar Avaliações</Text>
      <Text style={styles.modalSubtitle}>
        Escolha o período que deseja visualizar.
      </Text>

      {(["7_dias", "15_dias", "todos"] as EvolutionFilterType[]).map(
        (filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterOption,
              activeFilter === filter && styles.filterOptionSelected,
            ]}
            onPress={() => {
              onSelectFilter(filter);
              onClose();
            }}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextSelected,
              ]}
            >
              {filter === "7_dias"
                ? "Últimos 7 dias"
                : filter === "15_dias"
                  ? "Últimos 15 dias"
                  : "Todo o histórico"}
            </Text>
            {activeFilter === filter && (
              <Feather name="check-circle" size={20} color={PRIMARY_BLUE} />
            )}
          </TouchableOpacity>
        ),
      )}

      <TouchableOpacity
        style={[
          styles.filterOption,
          activeFilter === "mes_especifico" && styles.filterOptionSelected,
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "mes_especifico" && styles.filterTextSelected,
          ]}
        >
          Mês / Data Específica
        </Text>
        {activeFilter === "mes_especifico" ? (
          <Feather name="check-circle" size={20} color={PRIMARY_BLUE} />
        ) : (
          <Feather name="calendar" size={18} color="#64748B" />
        )}
      </TouchableOpacity>
    </>
  );

  const renderDatePicker = () => (
    <>
      <View style={styles.calendarHeaderRow}>
        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
          <Feather name="arrow-left" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Selecione uma Data</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.modalSubtitle}>
        O mês correspondente à data será exibido.
      </Text>

      <View style={styles.calendarWrapper}>
        <DateTimePicker
          value={tempDate}
          mode="date"
          themeVariant="light"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          locale="pt-BR"
          onChange={(event, date) => {
            if (date && Platform.OS === "android") handleSelectMonth(date);
            else if (date) setTempDate(date);
          }}
        />
      </View>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          style={styles.confirmCalendarBtn}
          onPress={() => handleSelectMonth(tempDate)}
        >
          <Text style={styles.confirmCalendarBtnText}>Confirmar</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
          <View style={styles.modalDragIndicator} />
          {!showDatePicker ? renderFilterOptions() : renderDatePicker()}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: 350,
  },
  modalDragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  filterOptionSelected: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  filterText: { fontSize: 16, color: "#334155", fontWeight: "600" },
  filterTextSelected: { color: "#3B82F6", fontWeight: "700" },
  calendarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
  },
  confirmCalendarBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  confirmCalendarBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
