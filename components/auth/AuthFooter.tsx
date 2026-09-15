import { useTermsUrls } from "@/hooks/terms/useTermsUrls";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function AuthFooter() {
  const { urlTermoUso, urlPrivacidade } = useTermsUrls();

  const handleContactSupport = async () => {
    const url = "mailto:contato@falecomadoria.com.br";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Aviso",
          "Nenhum aplicativo de e-mail configurado. Por favor, envie sua dúvida para contato@falecomadoria.com.br",
        );
      }
    } catch (error) {
      console.log("Erro ao tentar abrir e-mail:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Desenvolvido por</Text>
        <Text style={styles.brand}>PLANNY</Text>
      </View>

      <View style={styles.linksRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Linking.openURL(urlTermoUso)}
        >
          <Text style={styles.link}>Termos</Text>
        </TouchableOpacity>

        <Text style={styles.dot}>·</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Linking.openURL(urlPrivacidade)}
        >
          <Text style={styles.link}>Privacidade</Text>
        </TouchableOpacity>

        <Text style={styles.dot}>·</Text>

        <TouchableOpacity activeOpacity={0.7} onPress={handleContactSupport}>
          <Text style={styles.linkSupport}>Fale Conosco</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
    paddingBottom: 20, 
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  link: {
    fontSize: 10,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  linkSupport: {
    fontSize: 10,
    color: "#3B82F6", 
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  dot: {
    fontSize: 12,
    color: "#CBD5E1",
  },
});
