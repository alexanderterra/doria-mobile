import { CourseVideo } from "@/types/courses";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DARK_TEXT = "#0F172A";
const PRIMARY_BLUE = "#3B82F6";

interface CourseCardProps {
  video: CourseVideo;
  isCompleted: boolean;
  onPress: () => void;
}

export function CourseCard({ video, isCompleted, onPress }: CourseCardProps) {
  const isExternal = !!video.externalLink;

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: video.coverUrl }}
          style={styles.thumbnailImage}
          contentFit={isExternal ? "fill" : "cover"}
          transition={200}
        />
        <View style={styles.gradientOverlay} />
        {!isExternal && (
          <View style={styles.playButton}>
            <Feather
              name="play"
              size={18}
              color="#FFFFFF"
              style={{ marginLeft: 2 }}
            />
          </View>
        )}

        <View style={styles.durationBadge}>
          <Feather
            name={isExternal ? "book-open" : "clock"}
            size={10}
            color="#CBD5E1"
          />
          <Text style={styles.durationText}>
            {video.durationInfo || video.duration}
          </Text>
        </View>

        {isCompleted && (
          <View style={styles.completedOverlay}>
            <View style={styles.completedBadge}>
              <Feather name="check" size={12} color="#FFFFFF" />
              <Text style={styles.completedText}>Concluída</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {video.title}
        </Text>

        {video.author && (
          <Text style={styles.authorText} numberOfLines={1}>
            <Feather name="user" size={10} /> {video.author}
          </Text>
        )}

        <Text style={styles.cardDescription} numberOfLines={2}>
          {video.description}
        </Text>

        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, isCompleted && styles.ctaTextDone]}>
            {isExternal
              ? "Ver detalhes do curso"
              : isCompleted
                ? "Assistir novamente"
                : "Assistir aula"}
          </Text>
          <Feather
            name={isExternal ? "external-link" : "arrow-right"}
            size={13}
            color={isCompleted ? "#94A3B8" : PRIMARY_BLUE}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardCompleted: {
    borderColor: "#D1FAE5",
    backgroundColor: "#FAFFFE",
  },

  thumbnailContainer: {
    width: "100%",
    height: 148,
    backgroundColor: "#CBD5E1",
    position: "relative",
  },
  thumbnailImage: { width: "100%", height: "100%" },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(15,23,42,0.35)",
  },

  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15,23,42,0.65)",
    marginTop: -22,
    marginLeft: -22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },

  durationBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15,23,42,0.7)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: { color: "#E2E8F0", fontSize: 10, fontWeight: "700" },

  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16,185,129,0.15)",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 10,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },

  cardInfo: { padding: 14 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK_TEXT,
    lineHeight: 19,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "600",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
    marginBottom: 12,
  },

  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY_BLUE,
  },
  ctaTextDone: {
    color: "#94A3B8",
  },
});
