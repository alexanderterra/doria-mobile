import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isTyping: boolean;
  placeholder?: string;
  disabled?: boolean;
  onAttachPress?: () => void;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  isTyping,
  placeholder = "Envie uma mensagem...",
  disabled = false,
}: ChatInputProps) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const isActive = value.trim().length > 0 && !isTyping && !disabled;

  const dynamicPaddingBottom = isKeyboardVisible
    ? 10
    : Platform.OS === "ios"
      ? 130
      : 115;

  return (
    <View
      style={[styles.inputWrapper, { paddingBottom: dynamicPaddingBottom }]}
    >
      <View style={styles.pillContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          multiline
          editable={!isTyping && !disabled}
          autoCorrect={true}
          spellCheck={true}
          keyboardType="default"
          textContentType="none"
        />

        <TouchableOpacity
          onPress={onSend}
          disabled={!isActive}
          style={styles.sendBtnWrap}
        >
          {isActive ? (
            <LinearGradient
              colors={["#60A5FA", "#3B82F6", "#1D4ED8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtnGradient}
            >
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
            </LinearGradient>
          ) : (
            <View style={styles.sendBtnInactive}>
              <MaterialIcons name="send" size={20} color="#CBD5E1" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: DARK_TEXT,
    paddingHorizontal: 8,
    maxHeight: 100,
  },
  sendBtnWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  sendBtnGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnInactive: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
});
