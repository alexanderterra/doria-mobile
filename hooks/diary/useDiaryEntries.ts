import { DiaryEntry } from "@/components/diary/HistoryList";
import { diaryService } from "@/services/diary/diaryService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export function useDiaryEntries() {
  const [history, setHistory] = useState<DiaryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [sleepLevel, setSleepLevel] = useState<number | null>(null);
  const [anxietyLevel, setAnxietyLevel] = useState<number | null>(null);

  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await diaryService.getHistory();
      if (response.success && response.data) {
        setHistory((response.data as DiaryEntry[]).reverse());
      }
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  const handleEditPress = (entry: any) => {
    setPainLevel(entry.level ?? 0);
    setSleepLevel(entry.sleepLevel ?? 0);
    setAnxietyLevel(entry.anxietyLevel ?? 0);
    setNote(entry.note || "");
    setEditingId(entry.id);
  };

  const handleCancelEdit = () => {
    setPainLevel(null);
    setSleepLevel(null);
    setAnxietyLevel(null);
    setNote("");
    setEditingId(null);
  };

  const handleSave = async (onSuccess?: () => void) => {
    if (painLevel === null || sleepLevel === null || anxietyLevel === null)
      return;

    setIsSaving(true);
    try {
      const payload = {
        level: painLevel,
        sleepLevel: sleepLevel,
        anxietyLevel: anxietyLevel,
        note: note.trim(),
      };

      if (editingId) {
        const response = await diaryService.updateEntry(editingId, payload);
        if (response.success && response.data) {
          setHistory((prev) =>
            prev.map((item) =>
              item.id === editingId ? (response.data as DiaryEntry) : item,
            ),
          );
          handleCancelEdit();
          onSuccess?.();
        } else {
          Alert.alert(
            "Aviso",
            response.message || "Erro ao atualizar registro.",
          );
        }
      } else {
        const response = await diaryService.saveEntry(payload);
        if (response.success && response.data) {
          setHistory([response.data as DiaryEntry, ...history]);
          handleCancelEdit();
          onSuccess?.();
        } else {
          Alert.alert("Aviso", response.message || "Não foi possível salvar.");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar entrada:", error);
      Alert.alert("Erro", "Falha na conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    history,
    isLoadingHistory,
    isSaving,
    painLevel,
    setPainLevel,
    sleepLevel,
    setSleepLevel,
    anxietyLevel,
    setAnxietyLevel,
    note,
    setNote,
    editingId,
    handleEditPress,
    handleCancelEdit,
    handleSave,
    refreshHistory: fetchHistory,
  };
}
