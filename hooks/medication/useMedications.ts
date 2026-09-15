import { medicationsService } from "@/services/medications/medicationsService";
import { cancelAllMedicationNotifications } from "@/services/notifications/medicationNotifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

function getMedicationId(medication: any): string | number | null {
  return (
    medication?.id ||
    medication?.id_medicacoes ||
    medication?.uuid ||
    medication?.medicationId ||
    medication?.idMedicacao ||
    null
  );
}

export function useMedications() {
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedications = async () => {
    setIsLoading(true);

    try {
      const response = await medicationsService.getMedications();

      if (response.success && response.data) {
        setMedications(response.data);
      } else {
        setMedications([]);
      }
    } catch (error) {
      console.error("Erro ao carregar medicações:", error);
      setMedications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedication = async (id: string | number) => {
    if (!id) {
      Alert.alert("Erro", "Identificador da medicação não encontrado.");
      return;
    }

    Alert.alert(
      "Excluir Medicação",
      "Tem certeza que deseja remover esta medicação? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const res = await medicationsService.deleteMedication(id);

            if (res.success) {
              try {
                await cancelAllMedicationNotifications(id);
              } catch (error) {
                console.error("Erro ao cancelar alarmes:", error);
              }

              setMedications((prev) =>
                prev.filter(
                  (medication) =>
                    String(getMedicationId(medication)) !== String(id),
                ),
              );
            } else {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, []),
  );

  return {
    medications,
    isLoading,
    fetchMedications,
    deleteMedication,
  };
}
