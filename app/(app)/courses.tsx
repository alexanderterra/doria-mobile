import { BannerSlot } from "@/components/banners/BannerSlot";
import { Header } from "@/components/common/Header";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseDetailView } from "@/components/courses/CourseDetailView";
import { CoursePlayer } from "@/components/courses/CoursePlayer";
import { useAuth } from "@/contexts/AuthContext";
import { coursesService } from "@/services/courses/coursesService";
import { CourseCategory, CourseVideo } from "@/types/courses";
import { Redirect, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DARK_TEXT = "#0F172A";
const PRIMARY_BLUE = "#3B82F6";

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const [activeVideo, setActiveVideo] = useState<CourseVideo | null>(null);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchCatalog = async () => {
        setLoading(true);
        const result = await coursesService.getCatalog();

        if (result.success && result.data) {
          setCatalog(result.data);
          setError(null);
        } else {
          setError(result.message || "Não foi possível carregar os cursos.");
        }

        setLoading(false);
      };

      fetchCatalog();
    }, []),
  );

  const toggleVideoCompletion = (id: string) => {
    setCompletedVideos((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id],
    );
  };

  const isCompleted = (id: string) => completedVideos.includes(id);

  const renderActiveContent = () => {
    if (!activeVideo) return null;

    if (activeVideo.externalLink) {
      return (
        <CourseDetailView
          course={activeVideo}
          onBack={() => setActiveVideo(null)}
        />
      );
    }

    return (
      <CoursePlayer
        video={activeVideo}
        isCompleted={isCompleted(activeVideo.id)}
        onBack={() => setActiveVideo(null)}
        onToggleComplete={() => toggleVideoCompletion(activeVideo.id)}
      />
    );
  };

  const renderCatalog = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Conhecimento que transforma{"\n"}
          <Text style={styles.heroTitleAccent}>sua prática</Text>
        </Text>

        <BannerSlot
          local="cursos_mobile"
          publicoAlvo={role ?? undefined}
          style={styles.heroBanner}
        />
      </View>

      <View style={styles.divider} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={PRIMARY_BLUE}
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        <Text style={styles.stateMessage}>{error}</Text>
      ) : catalog.length === 0 ? (
        <Text style={styles.stateMessage}>
          Nenhum curso disponível no momento.
        </Text>
      ) : (
        catalog.map((section, index) => {
          const sectionCompleted = section.videos.filter((v) =>
            isCompleted(v.id),
          ).length;
          const sectionProgressPercent =
            section.videos.length > 0
              ? (sectionCompleted / section.videos.length) * 100
              : 0;

          return (
            <View key={section.id} style={styles.sectionWrapper}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIndexPill}>
                  <Text style={styles.sectionIndexText}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <View style={styles.sectionMeta}>
                  <Text style={styles.sectionTitle}>
                    {section.sectionTitle}
                  </Text>
                  <Text style={styles.sectionCount}>
                    {sectionCompleted}/{section.videos.length} concluídas
                  </Text>
                  <View style={styles.sectionProgressTrack}>
                    <View
                      style={[
                        styles.sectionProgressFill,
                        { width: `${sectionProgressPercent}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {section.videos.map((video) => (
                  <CourseCard
                    key={video.id}
                    video={video}
                    isCompleted={isCompleted(video.id)}
                    onPress={() => setActiveVideo(video)}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const isExternalView = activeVideo && activeVideo.externalLink;

  if (role === "paciente") {
    return <Redirect href="/(app)/chat" />;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: isExternalView ? 0 : insets.top + 10 },
      ]}
    >
      {!isExternalView && (
        <Header
          title={activeVideo ? "Assistindo Aula" : "Área de Cursos"}
          showBackButton={false}
        />
      )}

      {activeVideo ? renderActiveContent() : renderCatalog()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 100 },
  stateMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 22,
    marginTop: 40,
  },
  heroSection: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 28 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK_TEXT,
    lineHeight: 30,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroTitleAccent: { color: "#3B82F6" },
  heroBanner: { marginTop: 14 },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 22,
    marginBottom: 8,
  },
  sectionWrapper: { marginTop: 28 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 22,
    marginBottom: 16,
    gap: 12,
  },
  sectionIndexPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  sectionIndexText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3B82F6",
    letterSpacing: 0.5,
  },
  sectionMeta: { flex: 1 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK_TEXT,
    lineHeight: 22,
  },
  sectionCount: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  sectionProgressTrack: {
    height: 5,
    backgroundColor: "#EFF6FF",
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 8,
  },
  sectionProgressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 99,
    minWidth: 5,
  },
  horizontalScroll: { paddingHorizontal: 22, gap: 14 },
});
