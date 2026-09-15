import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";

interface DateTimePickersProps {
  showDatePicker: boolean;
  showTimePicker: boolean;
  dateValue: Date;
  timeValue: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  onCloseDatePicker: () => void;
  onCloseTimePicker: () => void;
}

export function DateTimePickers({
  showDatePicker,
  showTimePicker,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  onCloseDatePicker,
  onCloseTimePicker,
}: DateTimePickersProps) {
  const renderPicker = (
    show: boolean,
    value: Date,
    mode: "date" | "time",
    onChange: (date: Date) => void,
    onClose: () => void,
    confirmText: string,
  ) => {
    if (!show) return null;

    if (Platform.OS === "ios") {
      return (
        <Modal visible={show} transparent animationType="fade">
          <View style={styles.iosOverlay}>
            <View style={styles.iosPickerContainer}>
              <TouchableOpacity
                style={styles.iosPickerConfirmBtn}
                onPress={onClose}
              >
                <Text style={styles.iosPickerConfirmText}>{confirmText}</Text>
              </TouchableOpacity>
              <DateTimePicker
                value={value}
                mode={mode}
                is24Hour={true}
                display="spinner"
                themeVariant="light"
                locale="pt-BR"
                onChange={(e, date) => {
                  if (date) onChange(date);
                }}
              />
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <DateTimePicker
        value={value}
        mode={mode}
        is24Hour={true}
        display="default"
        locale="pt-BR"
        onChange={(e, date) => {
          if (date) onChange(date);
          onClose();
        }}
      />
    );
  };

  return (
    <>
      {renderPicker(
        showDatePicker,
        dateValue,
        "date",
        onDateChange,
        onCloseDatePicker,
        "Confirmar Data",
      )}
      {renderPicker(
        showTimePicker,
        timeValue,
        "time",
        onTimeChange,
        onCloseTimePicker,
        "Confirmar Horário",
      )}
    </>
  );
}

const styles = StyleSheet.create({
  iosOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  iosPickerContainer: {
    backgroundColor: "#FFF",
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosPickerConfirmBtn: {
    alignSelf: "flex-end",
    padding: 16,
  },
  iosPickerConfirmText: {
    color: PRIMARY_BLUE,
    fontSize: 16,
    fontWeight: "700",
  },
});
