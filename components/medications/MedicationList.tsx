import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface MedicationListProps {
  medications: any[];
  isLoading: boolean;
  onReminderPress: (id: string | number) => void;
  onDeletePress: (id: string | number) => void;
}

export function MedicationList({
  medications,
  isLoading,
  onReminderPress,
}: MedicationListProps) {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Carregando medicações...</Text>
      </View>
    );
  }

  if (medications.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="plus-circle" size={32} color={PRIMARY_BLUE} />
          </View>
        </View>
        <Text style={styles.emptyStateTitle}>Nenhuma medicação</Text>
        <Text style={styles.emptyStateSub}>
          Toque em &quot;Nova&quot; no topo para adicionar seu primeiro
          medicamento
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>
        {medications.length}{" "}
        {medications.length === 1 ? "medicação" : "medicações"} ativa
        {medications.length === 1 ? "" : "s"}
      </Text>

      {medications.map((med) => {
        const id = med.id_medicacoes || med.id || med.uuid;
        const nome = med.nome || med.medicationName || "Medicação";
        const frequencia = med.frequencia || med.frequency || "Uso único";

        const fimStr =
          med.periodo_fim || med.fim || med.data_fim || med.endDate;

        let isContinuo =
          med.continuo === true ||
          med.continuo === "true" ||
          med.uso_continuo === true ||
          med.uso_continuo === "true" ||
          (fimStr && fimStr.includes("2099"));

        let dataFimFormatada = "Em andamento";

        if (fimStr && !isContinuo) {
          try {
            const dataLimpa = fimStr.split("T")[0];
            const [ano, mes, dia] = dataLimpa.split("-");
            dataFimFormatada = `${dia}/${mes}/${ano}`;
          } catch (e) {
            console.log("Erro ao formatar data", e);
          }
        }
        const inicioStr =
          med.periodo_inicio || med.inicio || med.data_inicio || med.startDate;
        let dataInicioFormatada = "";
        if (inicioStr) {
          try {
            const [ano, mes, dia] = inicioStr.split("T")[0].split("-");
            dataInicioFormatada = `${dia}/${mes}/${ano}`;
          } catch (e) {}
        }

        const getFrequencyColor = () => {
          const freq = frequencia.toLowerCase();
          if (freq.includes("4 em 4") || freq.includes("6 em 6"))
            return "#EF4444";
          if (freq.includes("8 em 8") || freq.includes("12 em 12"))
            return "#F59E0B";
          if (freq.includes("único")) return "#8B5CF6";
          return "#3B82F6";
        };

        return (
          <View key={id} style={styles.cardWrapper}>
            <View style={styles.card}>
              {/* Header com ícone dinâmico */}
              <View style={styles.cardHeader}>
                <View style={styles.medInfo}>
                  <View
                    style={[
                      styles.medIcon,
                      { backgroundColor: getFrequencyColor() + "15" },
                    ]}
                  >
                    <Feather
                      name="plus-circle"
                      size={24}
                      color={getFrequencyColor()}
                    />
                  </View>
                  <View style={styles.medDetails}>
                    <Text style={styles.medName} numberOfLines={1}>
                      {nome}
                    </Text>
                    <View style={styles.frequencyChip}>
                      <Feather name="clock" size={12} color="#64748B" />
                      <Text style={styles.frequencyText}>{frequencia}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onReminderPress(id)}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-3" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {isContinuo
                      ? "Uso Contínuo"
                      : frequencia === "Uso único"
                        ? dataInicioFormatada
                          ? `Dia ${dataInicioFormatada}`
                          : "Dose Única"
                        : dataFimFormatada === "Em andamento"
                          ? "Em andamento"
                          : `Até ${dataFimFormatada}`}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerItem}>
                  <Feather name="calendar" size={14} color="#94A3B8" />
                  <Text style={styles.footerText}>{frequencia}</Text>
                </View>
                <View
                  style={[
                    styles.durationBadge,
                    isContinuo && styles.durationBadgeContinuous,
                  ]}
                >
                  <Feather
                    name={isContinuo ? "repeat" : "calendar"}
                    size={12}
                    color={isContinuo ? "#16A34A" : "#EA580C"}
                  />
                  <Text
                    style={[
                      styles.durationText,
                      isContinuo && { color: "#16A34A" },
                    ]}
                  >
                    {isContinuo
                      ? "Contínuo"
                      : frequencia === "Uso único"
                        ? "Dose Única"
                        : dataFimFormatada === "Em andamento"
                          ? "Em andamento"
                          : `Até ${dataFimFormatada}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
  listContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
    marginLeft: 4,
  },
  emptyState: {
    padding: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginBottom: 24,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateTitle: {
    color: DARK_TEXT,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyStateSub: {
    color: "#64748B",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  medInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 4,
  },
  frequencyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#64748B",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  durationBadgeContinuous: {
    backgroundColor: "#F0FDF4",
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EA580C",
  },
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 20,
    marginLeft: 8,
    gap: 4,
  },
  deleteActionText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
