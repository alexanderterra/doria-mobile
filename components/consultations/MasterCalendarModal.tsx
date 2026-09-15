import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface MasterCalendarModalProps {
  visible: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export function MasterCalendarModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
}: MasterCalendarModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        {Platform.OS === "ios" && (
          <View style={styles.header}>
            <Text style={styles.title}>Escolha a Data</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "calendar"}
            themeVariant="light"
            style={
              Platform.OS === "ios" ? { width: 320, alignSelf: "center" } : {}
            }
            locale="pt-BR"
            onChange={(e, date) => {
              if (Platform.OS === "android") onClose();
              if (date) {
                onSelectDate(date);
                if (Platform.OS === "ios") onClose();
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  popup: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    width: "90%",
    maxWidth: 360,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_TEXT,
  },
  closeText: {
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
