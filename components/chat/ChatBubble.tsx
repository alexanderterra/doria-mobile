import { FormattedText } from "./FormattedText"; 
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DARK_TEXT = "#0F172A";

interface ChatBubbleProps {
  isUser: boolean;
  message: string;
  time: string;
}

export function ChatBubble({ isUser, message, time }: ChatBubbleProps) {
  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <LinearGradient
          colors={["#60A5FA", "#3B82F6", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message}</Text>
        </LinearGradient>
        {!!time && <Text style={styles.userTime}>{time}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.botContainer}>
      <View style={styles.botBubble}>
        <FormattedText text={message} style={styles.botText} />
      </View>
      {!!time && <Text style={styles.botTime}>{time}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  userBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
  },
  userTime: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
    marginRight: 8,
  },
  botContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  botBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    backgroundColor: "#F1F5F9",
  },
  botText: {
    color: DARK_TEXT,
    fontSize: 15,
    lineHeight: 20,
  },
  botTime: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
    marginLeft: 8,
  },
});
