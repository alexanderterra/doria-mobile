import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Header } from "@/components/common/Header";
import { useChat } from "@/hooks/auth/useChat";
import { useUser } from "@/hooks/profile/useuser";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const {
    messages,
    isTyping,
    isLoadingHistory,
    scrollViewRef,
    sendMessage,
    scrollToEnd,
  } = useChat();
  const [inputText, setInputText] = useState("");

  const { user } = useUser();
  const isPaciente = user?.role?.toLowerCase() === "paciente";

  useEffect(() => {
    scrollToEnd();
  }, [messages, isTyping, scrollToEnd]);

  const handleSend = () => {
    if (inputText.trim() === "") return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <Header useLogo={true} />

      {isPaciente && (
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            A DOR.IA pode cometer erros. Considere verificar informações
            importantes.
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      {isLoadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToEnd}
          onLayout={scrollToEnd}
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              isUser={message.isUser}
              message={message.message}
              time={message.time}
            />
          ))}

          {isTyping && <TypingIndicator />}
        </ScrollView>
      )}

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        isTyping={isTyping}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  disclaimerContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 4,
    width: "100%",
  },
  disclaimerText: {
    textAlign: "center",
    fontSize: 11,
    color: "#94A3B8",
    paddingHorizontal: 20,
  },
});
