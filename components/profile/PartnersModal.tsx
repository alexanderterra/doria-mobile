import { partnersService } from "@/services/partners/partnersService";
import { Partner } from "@/types/partners";
import { isSafeUrl } from "@/utils/url";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PartnersModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PartnersModal({ visible, onClose }: PartnersModalProps) {
  const insets = useSafeAreaInsets();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const fetchPartners = async () => {
      setLoading(true);
      const result = await partnersService.getPartners();

      if (result.success && result.data) {
        setPartners(result.data);
        setError(null);
      } else {
        setError(result.message || "Não foi possível carregar os parceiros.");
      }

      setLoading(false);
    };

    fetchPartners();
  }, [visible]);

  const handleOpenLink = (url: string) => {
    if (!isSafeUrl(url)) return;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS === "android" ? insets.top : 0 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nossos Parceiros</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
        >
          <Text style={styles.subtitle}>
            Conheça as empresas e instituições que acreditam no propósito do
            DOR.IA e nos ajudam a transformar a gestão da dor.
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#3B82F6"
              style={{ marginTop: 40 }}
            />
          ) : error ? (
            <Text style={styles.stateMessage}>{error}</Text>
          ) : partners.length === 0 ? (
            <Text style={styles.stateMessage}>
              Nenhum parceiro disponível no momento.
            </Text>
          ) : (
            <View style={styles.cardsContainer}>
              {partners.map((partner) => (
                <TouchableOpacity
                  key={partner.id}
                  style={styles.partnerCard}
                  onPress={() => handleOpenLink(partner.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.logoContainer}>
                    <Image
                      source={{ uri: partner.logo_url }}
                      style={styles.logo}
                      contentFit="contain"
                    />
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.partnerName}>{partner.nome}</Text>
                    <Text style={styles.partnerDescription}>
                      {partner.descricao}
                    </Text>
                  </View>
                  <Feather name="external-link" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  scrollContent: {
    padding: 20,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 24,
  },
  stateMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 40,
  },
  cardsContainer: {
    gap: 12,
  },
  partnerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    width: 52,
    height: 52,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 6,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  partnerDescription: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
