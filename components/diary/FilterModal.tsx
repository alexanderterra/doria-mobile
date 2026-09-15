import { FilterType } from "@/hooks/diary/useDiaryFilters";
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

interface FilterModalProps {
  visible: boolean;
  activeFilter: FilterType;
  selectedMonthDate: Date;
  onClose: () => void;
  onSelectFilter: (filter: FilterType, date?: Date) => void;
}

export function FilterModal({
  visible,
  activeFilter,
  selectedMonthDate,
  onClose,
  onSelectFilter,
}: FilterModalProps) {
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
      <Text style={styles.modalTitle}>Filtrar Histórico</Text>
      <Text style={styles.modalSubtitle}>
        Escolha o período que deseja visualizar e exportar.
      </Text>

      <TouchableOpacity
        style={[
          styles.filterOption,
          activeFilter === "7_dias" && styles.filterOptionSelected,
        ]}
        onPress={() => {
          onSelectFilter("7_dias");
          onClose();
        }}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "7_dias" && styles.filterTextSelected,
          ]}
        >
          Últimos 7 dias
        </Text>
        {activeFilter === "7_dias" && (
          <Feather name="check-circle" size={20} color={PRIMARY_BLUE} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterOption,
          activeFilter === "15_dias" && styles.filterOptionSelected,
        ]}
        onPress={() => {
          onSelectFilter("15_dias");
          onClose();
        }}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "15_dias" && styles.filterTextSelected,
          ]}
        >
          Últimos 15 dias
        </Text>
        {activeFilter === "15_dias" && (
          <Feather name="check-circle" size={20} color={PRIMARY_BLUE} />
        )}
      </TouchableOpacity>

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

      <TouchableOpacity
        style={[
          styles.filterOption,
          activeFilter === "todos" && styles.filterOptionSelected,
        ]}
        onPress={() => {
          onSelectFilter("todos");
          onClose();
        }}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === "todos" && styles.filterTextSelected,
          ]}
        >
          Todo o histórico
        </Text>
        {activeFilter === "todos" && (
          <Feather name="check-circle" size={20} color={PRIMARY_BLUE} />
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
        O mês correspondente à data escolhida será exibido.
      </Text>

      <View style={styles.calendarWrapper}>
        <DateTimePicker
          value={tempDate}
          mode="date"
          themeVariant="light"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          locale="pt-BR"
          onChange={(event, date) => {
            if (date && Platform.OS === "android") {
              handleSelectMonth(date);
            } else if (date) {
              setTempDate(date);
            }
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
