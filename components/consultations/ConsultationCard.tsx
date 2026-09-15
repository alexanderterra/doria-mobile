import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";
const LIGHT_BLUE = "#60A5FA";
const DARK_TEXT = "#0F172A";

interface ConsultationCardProps {
  consultation: any;
  onPress: (consultation: any) => void;
}

export function ConsultationCard({
  consultation,
  onPress,
}: ConsultationCardProps) {
  const rawTime =
    consultation.hora ||
    consultation.hora_consulta ||
    consultation.horario ||
    "--:--";
  const [hour, minute] = rawTime.split(":");

  const tituloConsulta = consultation.nome || "Consulta";

  const rawDate = consultation.data || consultation.data_consulta || "";
  let formattedDate = "Data não definida";
  if (rawDate) {
    const [ano, mes, dia] = rawDate.split("-");
    if (ano && mes && dia) formattedDate = `${dia}/${mes}/${ano}`;
  }

  const hasNotification =
    consultation.notificacaoAtiva || consultation.notificacao_ativa;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(consultation)}
      activeOpacity={0.75}
    >
      <View style={styles.accentBar} />

      <View style={styles.timeBlock}>
        <Text style={styles.timeHour}>{hour ?? "--"}</Text>
        <View style={styles.timeDot} />
        <Text style={styles.timeMinute}>{minute ?? "--"}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {tituloConsulta}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Feather name="calendar" size={12} color="#94A3B8" />
            <Text style={styles.badgeText}>{formattedDate}</Text>
          </View>

          {hasNotification && (
            <View style={[styles.badge, styles.notifBadge]}>
              <Feather name="bell" size={12} color={PRIMARY_BLUE} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.arrowBtn}>
        <Feather name="chevron-right" size={15} color={PRIMARY_BLUE} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: PRIMARY_BLUE,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  timeBlock: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 8,
  },
  timeHour: {
    fontSize: 18,
    fontWeight: "800",
    color: PRIMARY_BLUE,
    lineHeight: 20,
  },
  timeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#93C5FD",
    marginVertical: 2,
  },
  timeMinute: {
    fontSize: 15,
    fontWeight: "700",
    color: LIGHT_BLUE,
    lineHeight: 18,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#EEF2FF",
    marginHorizontal: 14,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 7,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFF",
    borderWidth: 1,
    borderColor: "#EEF2FF",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  notifBadge: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
});
