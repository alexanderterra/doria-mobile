import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { LevelSelector } from "./LevelSelector";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY_BLUE = "#3B82F6";

type MetricType = "pain" | "sleep" | "anxiety";

const getLevelColor = (level: number): string => {
  if (level <= 3) return "#EF4444"; 
  if (level <= 7) return "#EAB308"; 
  return "#22C55E";                 
};

const getLevelLabel = (level: number, type: MetricType): string => {
  if (type === "pain") {
    if (level === 10) return "Nenhuma";
    if (level >= 8) return "Muito leve";
    if (level >= 6) return "Leve";
    if (level >= 4) return "Moderada";
    if (level >= 2) return "Intensa";
    return "Insuportável";
  }

  if (type === "sleep") {
    if (level === 10) return "Dormi muito bem";
    if (level >= 7) return "Dormi razoável";
    if (level >= 4) return "Dormi mal";
    if (level >= 2) return "Muita insônia";
    return "Não dormi";
  }

  if (level === 10) return "Muito calmo";
  if (level >= 7) return "Levemente tenso";
  if (level >= 4) return "Ansioso";
  if (level >= 2) return "Muito ansioso";
  return "Crise/Exaustão";
};

interface MetricCardProps {
  title: string;
  description: string;
  type: MetricType;
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function MetricCard({
  title,
  description,
  type,
  selectedLevel,
  onSelectLevel,
  isOpen,
  onToggle,
}: MetricCardProps) {
  const hasValue = selectedLevel !== null;
  const levelColor = hasValue ? getLevelColor(selectedLevel!) : undefined;
  const levelLabel = hasValue ? getLevelLabel(selectedLevel!, type) : null;

  const getIcon = (metricType: MetricType): keyof typeof Feather.glyphMap => {
    if (metricType === "pain") return "activity";
    if (metricType === "sleep") return "moon";
    return "wind";
  };

  const iconName = getIcon(type);
  const iconColor = hasValue ? levelColor : "#94A3B8";
  const iconBgColor = hasValue ? levelColor + "1A" : "#F1F5F9";

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const handleSelect = (level: number) => {
    onSelectLevel(level);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isOpen) onToggle();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleToggle}
      style={[styles.metricCard, isOpen && styles.metricCardOpen]}
    >
      <View style={styles.metricRow}>
        <View style={styles.metricLeft}>
          <View
            style={[styles.metricIconBox, { backgroundColor: iconBgColor }]}
          >
            <Feather name={iconName} size={16} color={iconColor} />
          </View>
          <Text style={[styles.metricTitle, isOpen && styles.metricTitleOpen]}>
            {title}
          </Text>
        </View>

        <View style={styles.metricRight}>
          {hasValue && !isOpen && (
            <View
              style={[
                styles.levelPill,
                {
                  backgroundColor: levelColor + "20",
                  borderColor: levelColor + "40",
                },
              ]}
            >
              <Text style={[styles.levelPillNumber, { color: levelColor }]}>
                {selectedLevel}
              </Text>
              <Text style={[styles.levelPillLabel, { color: levelColor }]}>
                {levelLabel}
              </Text>
            </View>
          )}
          <Feather
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={isOpen ? PRIMARY_BLUE : "#94A3B8"}
          />
        </View>
      </View>

      {isOpen && (
        <View style={styles.selectorWrapper}>
          <LevelSelector
            selectedLevel={selectedLevel}
            onSelectLevel={handleSelect}
          />
          <View style={styles.descriptionBubble}>
            <Feather name="info" size={14} color="#64748B" />
            <Text style={styles.expandedDescription}>{description}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface PainEntryFormProps {
  painLevel: number | null;
  sleepLevel: number | null;
  anxietyLevel: number | null;
  note: string;
  isSaving: boolean;
  onSelectPainLevel: (level: number) => void;
  onSelectSleepLevel: (level: number) => void;
  onSelectAnxietyLevel: (level: number) => void;
  onChangeNote: (text: string) => void;
  onSave: () => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export function PainEntryForm({
  painLevel,
  sleepLevel,
  anxietyLevel,
  note,
  isSaving,
  onSelectPainLevel,
  onSelectSleepLevel,
  onSelectAnxietyLevel,
  onChangeNote,
  onSave,
  isEditing,
  onCancelEdit,
}: PainEntryFormProps) {
  const [openCard, setOpenCard] = useState<MetricType | null>("pain");

  const isFormIncomplete =
    painLevel === null || sleepLevel === null || anxietyLevel === null;

  const toggle = (card: MetricType) => {
    setOpenCard((prev) => (prev === card ? null : card));
  };

  return (
    <View style={styles.container}>
      <MetricCard
        title="Como você está se sentindo hoje?"
        description="Com relação à sua dor: 0 insuportável e 10 estou me sentindo bem"
        type="pain"
        selectedLevel={painLevel}
        onSelectLevel={onSelectPainLevel}
        isOpen={openCard === "pain"}
        onToggle={() => toggle("pain")}
      />

      <MetricCard
        title="Como você avalia seu sono hoje?"
        description="0 não dormi e 10 tive um ótimo sono"
        type="sleep"
        selectedLevel={sleepLevel}
        onSelectLevel={onSelectSleepLevel}
        isOpen={openCard === "sleep"}
        onToggle={() => toggle("sleep")}
      />

      <MetricCard
        title="Como está seu emocional neste momento?"
        description="0 crise/exaustão e 10 estou me sentindo bem"
        type="anxiety"
        selectedLevel={anxietyLevel}
        onSelectLevel={onSelectAnxietyLevel}
        isOpen={openCard === "anxiety"}
        onToggle={() => toggle("anxiety")}
      />

      <View style={styles.noteInputContainer}>
        <TextInput
          style={styles.noteInput}
          placeholder="Escreva como você está se sentindo..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={onChangeNote}
          textAlignVertical="top"
        />

        {/* Botão de Microfone Mockado */}
        {/* <TouchableOpacity
          style={styles.micButton}
          activeOpacity={0.7}
          onPress={() => console.log("Mock: Iniciar gravação de voz")}
        >
          <Feather name="mic" size={16} color={PRIMARY_BLUE} />
        </TouchableOpacity> */}
      </View>

      {isEditing ? (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancelEdit}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              styles.updateBtn,
              (isFormIncomplete || isSaving) && styles.btnDisabled,
            ]}
            activeOpacity={0.8}
            onPress={onSave}
            disabled={isFormIncomplete || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Atualizar</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (isFormIncomplete || isSaving) && styles.btnDisabled,
          ]}
          activeOpacity={0.8}
          onPress={onSave}
          disabled={isFormIncomplete || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather
                name="check"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.saveBtnText}>Salvar registro</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    width: "100%",
    marginBottom: 32,
  },

  metricCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  metricCardOpen: {
    borderColor: PRIMARY_BLUE,
    backgroundColor: "#F8FAFC",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowColor: PRIMARY_BLUE,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  metricRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  metricTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
  },
  metricTitleOpen: {
    color: PRIMARY_BLUE,
  },

  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  levelPillNumber: { fontSize: 13, fontWeight: "800" },
  levelPillLabel: { fontSize: 12, fontWeight: "500" },

  selectorWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  // 🔥 Estilos atualizados para a pílula (bubble) da descrição
  descriptionBubble: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignSelf: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  expandedDescription: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  noteInputContainer: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  noteInput: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 44,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 90,
    lineHeight: 20,
  },
  micButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  saveBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  btnDisabled: { opacity: 0.45 },

  updateBtn: {
    backgroundColor: "#22C55E",
    flex: 1,
    marginTop: 0,
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  cancelBtnText: { color: "#64748B", fontSize: 14, fontWeight: "700" },
});
