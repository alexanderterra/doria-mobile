import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    LayoutAnimation,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

function formatarData(dataIso: string) {
  if (!dataIso) return "";

  try {
    const date = new Date(dataIso);
    const diasSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    const diaSemana = diasSemana[date.getDay()];
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = meses[date.getMonth()];

    return `${diaSemana}, ${dia} de ${mes}`;
  } catch (error) {
    return dataIso; 
  }
}

export function EvolutionCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleExpand}
        style={styles.cardHeader}
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconBg}>
            <Feather name="activity" size={18} color={PRIMARY_BLUE} />
          </View>
          <View>
            <Text style={styles.dateText}>{formatarData(item.criado_em)}</Text>

            <Text style={styles.previewText} numberOfLines={1}>
              {item.localizacao} • {item.caracteristica}
            </Text>
          </View>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <View style={styles.divider} />
          <DetailRow label="Início" value={item.inicio} />
          <DetailRow label="Duração" value={item.duracao} />
          <DetailRow label="Padrão Temporal" value={item.padrao_temporal} />
          <DetailRow label="Fatores/Causa" value={item.fatores} />
          <DetailRow label="Irradiação" value={item.irradiacao} />
          <DetailRow
            label="Sintomas Associados"
            value={item.sintomas_associados}
          />
        </View>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 2,
  },
  previewText: { fontSize: 13, color: "#64748B" },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 12 },
  detailRow: { marginBottom: 10 },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY_BLUE,
    marginBottom: 2,
  },
  detailValue: { fontSize: 14, color: "#475569", lineHeight: 20 },
});
