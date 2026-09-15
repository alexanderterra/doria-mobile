import { CourseVideo } from "@/types/courses";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface CoursePlayerProps {
  video: CourseVideo;
  isCompleted: boolean;
  onBack: () => void;
  onToggleComplete: () => void;
}

export function CoursePlayer({
  video,
  isCompleted,
  onBack,
  onToggleComplete,
}: CoursePlayerProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <View style={styles.backIcon}>
          <Feather name="arrow-left" size={16} color={DARK_TEXT} />
        </View>
        <Text style={styles.backButtonText}>Voltar ao catálogo</Text>
      </TouchableOpacity>

      <View style={styles.playerWrapper}>
        <YoutubePlayer
          height={220}
          play={true}
          videoId={video.youtubeId}
          webViewStyle={{ opacity: 0.99 }}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.durationPill}>
            <Feather name="clock" size={11} color="#3B82F6" />
            <Text style={styles.durationPillText}>{video.duration}</Text>
          </View>
        </View>

        <Text style={styles.videoTitle}>{video.title}</Text>
        <Text style={styles.videoDescription}>{video.description}</Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[
            styles.completeButton,
            isCompleted && styles.completeButtonActive,
          ]}
          activeOpacity={0.85}
          onPress={onToggleComplete}
        >
          <View
            style={[
              styles.completeIconWrap,
              isCompleted && styles.completeIconWrapActive,
            ]}
          >
            <Feather
              name={isCompleted ? "check" : "circle"}
              size={16}
              color={isCompleted ? "#FFFFFF" : PRIMARY_BLUE}
            />
          </View>
          <Text
            style={[
              styles.completeButtonText,
              isCompleted && styles.completeButtonTextActive,
            ]}
          >
            {isCompleted ? "Aula Concluída" : "Marcar como concluída"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 100 },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  backIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButtonText: { fontSize: 14, fontWeight: "600", color: "#475569" },

  playerWrapper: {
    width: "100%",
    backgroundColor: "#000",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },

  content: { padding: 22 },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3B82F6",
  },

  videoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK_TEXT,
    marginBottom: 8,
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  videoDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 22,
  },

  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    gap: 12,
  },
  completeButtonActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  completeIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  completeIconWrapActive: {
    backgroundColor: "#10B981",
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_BLUE,
    flex: 1,
  },
  completeButtonTextActive: {
    color: "#065F46",
  },
});
