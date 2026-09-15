import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface TimePickerModalProps {
  visible: boolean;
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  title?: string;
}

export function TimePickerModal({
  visible,
  initialDate,
  onConfirm,
  onCancel,
  title = "Definir Horário",
}: TimePickerModalProps) {
  const [tempDate, setTempDate] = useState<Date>(initialDate);

  useEffect(() => {
    if (visible) setTempDate(initialDate);
  }, [visible, initialDate]);

  if (!visible) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={tempDate}
        mode="time"
        is24Hour={true}
        display="default"
        onChange={(event, date) => {
          if (event.type === "dismissed") {
            onCancel();
          } else if (date) {
            onConfirm(date);
          }
        }}
      />
    );
  }

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onCancel}
      />
      <View style={styles.popup}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour={true}
            display="spinner"
            themeVariant="light"
            style={{ width: 320, alignSelf: "center" }}
            locale="pt-BR"
            onChange={(e, date) => {
              if (date) setTempDate(date);
            }}
          />
        </View>

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
            <Text style={styles.textCancel}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnConfirm}
            onPress={() => onConfirm(tempDate)}
          >
            <Text style={styles.textConfirm}>Confirmar</Text>
          </TouchableOpacity>
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
    zIndex: 200, 
    elevation: 200,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popup: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    width: "90%",
    maxWidth: 360,
    zIndex: 201,
    elevation: 201,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: DARK_TEXT },
  pickerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  textCancel: { color: "#64748B", fontSize: 16, fontWeight: "600" },
  btnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY_BLUE,
    alignItems: "center",
  },
  textConfirm: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
