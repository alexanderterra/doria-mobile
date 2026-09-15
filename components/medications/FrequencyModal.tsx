import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";

interface FrequencyModalProps {
  visible: boolean;
  selectedFrequency: string;
  frequencies: string[];
  onSelect: (frequency: string) => void;
  onClose: () => void;
}

export function FrequencyModal({
  visible,
  selectedFrequency,
  frequencies,
  onSelect,
  onClose,
}: FrequencyModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecione a Frequência</Text>
          <FlatList
            data={frequencies}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedFrequency === item && {
                      color: PRIMARY_BLUE,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {item}
                </Text>
                {selectedFrequency === item && (
                  <Feather name="check" size={20} color={PRIMARY_BLUE} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalItemText: { fontSize: 16, color: "#334155" },
});
