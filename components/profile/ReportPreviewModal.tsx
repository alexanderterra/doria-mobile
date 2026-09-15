import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ReportPreviewModalProps {
  visible: boolean;
  data: any[];
  isExporting: boolean;
  onClose: () => void;
  onExport: () => void;
}

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

export function ReportPreviewModal({
  visible,
  data,
  isExporting,
  onClose,
  onExport,
}: ReportPreviewModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={24} color={DARK_TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prévia do Relatório</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBadge}>
          <Feather name="info" size={16} color={PRIMARY_BLUE} />
          <Text style={styles.infoText}>
            Esta é uma prévia. O PDF gerado terá um formato oficial para o seu
            médico.
          </Text>
        </View>

        <Text style={styles.recordCount}>
          {data.length} registros encontrados
        </Text>

        {data.map((item, index) => (
          <View key={item.id || index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>
                {item.date || "Data do registro"}
              </Text>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Dor</Text>
                <Text style={[styles.metricValue, { color: "#EF4444" }]}>
                  {item.level || "-"}/10
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Sono</Text>
                <Text style={[styles.metricValue, { color: PRIMARY_BLUE }]}>
                  {item.sleepLevel || "-"}/10
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Emocional</Text>
                <Text style={[styles.metricValue, { color: "#8B5CF6" }]}>
                  {item.anxietyLevel || "-"}/10
                </Text>
              </View>
            </View>
            {item.note && (
              <Text style={styles.descText} numberOfLines={2}>
                &quot;{item.note}&quot;
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.exportBtn, isExporting && { opacity: 0.7 }]}
          onPress={onExport}
          disabled={isExporting}
        >
          <Feather
            name={isExporting ? "loader" : "share"}
            size={20}
            color="#FFF"
          />
          <Text style={styles.exportBtnText}>
            {isExporting ? "Gerando PDF..." : "Exportar / Compartilhar PDF"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  closeBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: DARK_TEXT },
  scrollContent: { padding: 20, paddingBottom: 100 },
  infoBadge: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: PRIMARY_BLUE, lineHeight: 18 },
  recordCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 8,
  },
  dateText: { fontSize: 14, fontWeight: "700", color: DARK_TEXT },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metric: { alignItems: "center" },
  metricLabel: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: "800" },
  descText: {
    fontSize: 13,
    color: "#475569",
    fontStyle: "italic",
    marginTop: 8,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  exportBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  exportBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
