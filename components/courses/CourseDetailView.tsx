import { CourseVideo } from "@/types/courses";
import { isSafeUrl } from "@/utils/url";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  course: CourseVideo;
  onBack: () => void;
}

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

export function CourseDetailView({ course, onBack }: Props) {
  const insets = useSafeAreaInsets();

  const handleOpenMakadu = async () => {
    if (!course.externalLink || !isSafeUrl(course.externalLink)) return;
    try {
      const supported = await Linking.canOpenURL(course.externalLink);
      if (supported) {
        await Linking.openURL(course.externalLink);
      } else {
        Alert.alert("Erro", "Não foi possível abrir a plataforma do curso.");
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao redirecionar.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        <View
          style={[
            styles.heroSection,
            { paddingTop: Math.max(insets.top, 20) + 10 },
          ]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={24} color={DARK_TEXT} />
          </TouchableOpacity>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Feather name="monitor" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.infoTitle}>Formato</Text>
            <Text style={styles.infoValue}>{course.format || "Online"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Feather name="clock" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.infoTitle}>Duração</Text>
            <Text style={styles.infoValue}>
              {course.durationInfo || course.duration}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Feather name="calendar" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.infoTitle}>Acesso</Text>
            <Text style={styles.infoValue}>
              {course.availability || "1 Ano"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Feather name="award" size={20} color={PRIMARY_BLUE} />
            <Text style={styles.infoTitle}>Certificado</Text>
            <Text style={styles.infoValue}>
              {course.hasCertificate ? "Incluso" : "Verificar"}
            </Text>
          </View>
        </View>

        {/* Conteúdo Programático */}
        <View style={styles.curriculumSection}>
          <Text style={styles.sectionTitle}>Conteúdo do Curso</Text>
          {course.curriculum?.map((lesson, index) => (
            <View key={index} style={styles.lessonCard}>
              <View style={styles.lessonIconBox}>
                <Feather name="play-circle" size={20} color={PRIMARY_BLUE} />
              </View>
              <View style={styles.lessonMeta}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonSpeaker}>
                  Palestrante: {lesson.speaker}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View
        style={[
          styles.floatingFooter,
          { paddingBottom: (insets.bottom || 20) + 90 },
        ]}
      >
        <TouchableOpacity style={styles.ctaButton} onPress={handleOpenMakadu}>
          <Text style={styles.ctaText}>Veja mais na Makadu</Text>
          <Feather name="external-link" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  heroSection: {
    paddingHorizontal: 22,
    paddingBottom: 22,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 12,
  },
  badgeContainer: {
    backgroundColor: "#DBEAFE",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: PRIMARY_BLUE,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: DARK_TEXT,
    lineHeight: 32,
    marginBottom: 12,
  },
  description: { fontSize: 15, color: "#64748B", lineHeight: 22 },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 22,
    gap: 12,
    justifyContent: "space-between",
  },
  infoCard: {
    width: "47%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoTitle: { fontSize: 12, color: "#64748B", marginTop: 12, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: "700", color: DARK_TEXT },

  curriculumSection: { paddingHorizontal: 22, marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  lessonIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lessonMeta: { flex: 1 },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 4,
    lineHeight: 20,
  },
  lessonSpeaker: { fontSize: 12, color: "#64748B" },

  floatingFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 20,
    paddingTop: 16,
  },
  ctaButton: {
    backgroundColor: PRIMARY_BLUE,
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
