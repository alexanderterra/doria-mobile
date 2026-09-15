import { useTermsUrls } from "@/hooks/terms/useTermsUrls";
import { isSafeUrl } from "@/utils/url";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LgpdConsentModalProps {
  visible: boolean;
  onAccept: (dadosAceite: {
    termosUso: boolean;
    politicaPrivacidade: boolean;
  }) => void;
}

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

export function LgpdConsentModal({ visible, onAccept }: LgpdConsentModalProps) {
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [aceitaPrivacidade, setAceitaPrivacidade] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { urlTermoUso, urlPrivacidade } = useTermsUrls();

  const canSubmit = aceitaTermos && aceitaPrivacidade;

  const handleOpenLink = async (url: string) => {
    if (!isSafeUrl(url)) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      onAccept({
        termosUso: aceitaTermos,
        politicaPrivacidade: aceitaPrivacidade,
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Feather name="shield" size={32} color={PRIMARY_BLUE} />
          </View>
          
          <Text style={styles.title}>Atualização de Termos</Text>
          <Text style={styles.description}>
            Para continuarmos oferecendo uma experiência segura e de acordo com a LGPD, 
            precisamos que você revise e confirme nossos novos termos.
          </Text>

          <View style={styles.checkboxContainer}>
            <View>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAceitaTermos(!aceitaTermos)}
              >
                <View style={[styles.checkbox, aceitaTermos && styles.checkboxActive]}>
                  {aceitaTermos && <Feather name="check" size={14} color="#FFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  Li e aceito os <Text style={styles.bold}>Termos e Condições de Uso</Text> da plataforma Dor.ia.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.readLinkRow}
                onPress={() => handleOpenLink(urlTermoUso)}
              >
                <Feather name="external-link" size={12} color={PRIMARY_BLUE} />
                <Text style={styles.readLinkText}>Ler Termos de Uso</Text>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAceitaPrivacidade(!aceitaPrivacidade)}
              >
                <View style={[styles.checkbox, aceitaPrivacidade && styles.checkboxActive]}>
                  {aceitaPrivacidade && <Feather name="check" size={14} color="#FFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  Li e concordo com a <Text style={styles.bold}>Política de Privacidade</Text> e o tratamento de dados sensíveis de saúde.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.readLinkRow}
                onPress={() => handleOpenLink(urlPrivacidade)}
              >
                <Feather name="external-link" size={12} color={PRIMARY_BLUE} />
                <Text style={styles.readLinkText}>Ler Política de Privacidade</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Confirmar e Continuar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK_TEXT,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  checkboxContainer: {
    gap: 16,
    marginBottom: 32,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  readLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 36,
    marginTop: 4,
  },
  readLinkText: {
    color: PRIMARY_BLUE,
    fontWeight: "600",
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
    color: DARK_TEXT,
  },
  submitButton: {
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});