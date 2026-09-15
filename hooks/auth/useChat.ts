import { getAuthIdFromToken } from "@/services/api/jwt";
import { chatService } from "@/services/chat/chatService";
import { useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";

export interface Message {
  id: number;
  isUser: boolean;
  message: string;
  time: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const loadHistory = async () => {
      const authId = await getAuthIdFromToken();
      if (!authId) {
        setIsLoadingHistory(false);
        return;
      }

      const response = await chatService.getHistorico(authId);
      if (response.success && response.data) {
        const historyMessages: Message[] = response.data.map(
          (item, index) => ({
            id: -(response.data!.length - index),
            isUser: item.origem === "paciente",
            message: item.mensagem,
            time: "",
          }),
        );
        setMessages(historyMessages);
      }

      setIsLoadingHistory(false);
    };

    loadHistory();
  }, []);

  const formatBotResponse = (data: any): string => {
    if (typeof data === "string") return data;
    if (data?.output) return data.output;
    if (data?.text) return data.text;
    if (data?.message) return data.message;
    if (Array.isArray(data) && data.length > 0) {
      return data[0].output || data[0].text || JSON.stringify(data[0]);
    }
    if (typeof data === "object") return JSON.stringify(data);
    return "Desculpe, não consegui entender a resposta do servidor.";
  };

  const sendMessage = async (text: string) => {
    if (text.trim() === "") return;

    const userMessage: Message = {
      id: Date.now(),
      isUser: true,
      message: text.trim(),
      time: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(text);

      const botMessage: Message = {
        id: Date.now() + 1,
        isUser: false,
        message: response.success
          ? formatBotResponse(response.data)
          : "Ops! Tive um problema de conexão.",
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: Date.now() + 1,
        isUser: false,
        message: "Ops! Tive um problema de conexão. Tente novamente.",
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const scrollToEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return {
    messages,
    isTyping,
    isLoadingHistory,
    scrollViewRef,
    sendMessage,
    scrollToEnd,
  };
}
