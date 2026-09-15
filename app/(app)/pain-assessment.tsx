import { Header } from "@/components/common/Header";
import { EvolutionChipSelect } from "@/components/evolution/EvolutionChipSelect";
import { EvolutionFormCard } from "@/components/evolution/EvolutionFormCard";
import { evolutionService } from "@/services/evolution/evolutionService";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";
const BG = "#F8FAFC";
const PLACEHOLDER_COLOR = "#94A3B8";

const CARACTERISTICAS_DOR = [
  "Latejante",
  "Queimação",
  "Pontada",
  "Formigamento",
  "Aperto",
  "Peso",
];
const PADROES_TEMPORAIS = [
  "Pior de Manhã",
  "Pior à Noite",
  "Constante",
  "Vai e Volta",
];

const INITIAL_FORM_STATE = {
  inicio: "",
  localizacao: "",
  duracao: "",
  caracteristica: [] as string[],
  alivioAgravamento: "",
  irradiacao: "",
  padraoTemporal: "",
  sintomasAssociados: "",
};

export default function PainAssessmentScreen() {
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM_STATE);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setForm(INITIAL_FORM_STATE);
      };
    }, []),
  );

  const updateForm = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCaracteristica = (item: string) => {
    if (form.caracteristica.includes(item)) {
      updateForm(
        "caracteristica",
        form.caracteristica.filter((i) => i !== item),
      );
    } else {
      updateForm("caracteristica", [...form.caracteristica, item]);
    }
  };

  const togglePadraoTemporal = (item: string) => {
    updateForm("padraoTemporal", item === form.padraoTemporal ? "" : item);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        inicio: form.inicio,
        localizacao: form.localizacao,
        duracao: form.duracao,
        caracteristica: form.caracteristica.join(", "),
        fatores: form.alivioAgravamento,
        irradiacao: form.irradiacao,
        padrao_temporal: form.padraoTemporal,
        sintomas_associados: form.sintomasAssociados,
      };

      const response = await evolutionService.saveEvolution(payload);

      if (response.success) {
        Alert.alert("Excelente!", "Sua evolução foi registrada com sucesso.");
        router.replace("/(app)/evolutions-history");
      } else {
        Alert.alert(
          "Erro",
          "Não foi possível registrar a evolução. Tente novamente.",
        );
      }
    } catch (error) {
      console.error("Erro ao salvar evolução:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Header
        title="Minha Avaliação"
        showBackButton={true}
        onBack={() => router.push("/(app)/evolutions-history")}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EvolutionFormCard
            title="Início"
            description="Quando essa dor começou?"
          >
            <TextInput
              style={styles.input}
              placeholder="Ex: Ontem à noite, há 3 dias..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={form.inicio}
              onChangeText={(txt) => updateForm("inicio", txt)}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Localização"
            description="Onde dói exatamente?"
          >
            <TextInput
              style={styles.input}
              placeholder="Ex: Lombar direita, nuca..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={form.localizacao}
              onChangeText={(txt) => updateForm("localizacao", txt)}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Duração"
            description="Por quanto tempo sua dor dura?"
          >
            <TextInput
              style={styles.input}
              placeholder="Ex: Alguns minutos, horas, dia todo..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={form.duracao}
              onChangeText={(txt) => updateForm("duracao", txt)}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Característica"
            description="Como você descreve essa dor?"
          >
            <EvolutionChipSelect
              options={CARACTERISTICAS_DOR}
              selectedValues={form.caracteristica}
              onSelect={toggleCaracteristica}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Fatores e Atribuição"
            description="O que melhora ou piora? O que causou?"
          >
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Piora ao sentar. Acho que foi o treino de ontem..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              value={form.alivioAgravamento}
              onChangeText={(txt) => updateForm("alivioAgravamento", txt)}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Irradiação"
            description="A dor se espalha para outro lugar?"
          >
            <TextInput
              style={styles.input}
              placeholder="Ex: Desce para a perna esquerda..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              value={form.irradiacao}
              onChangeText={(txt) => updateForm("irradiacao", txt)}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Padrão Temporal"
            description="A dor varia ao longo do dia?"
          >
            <EvolutionChipSelect
              options={PADROES_TEMPORAIS}
              selectedValues={form.padraoTemporal}
              onSelect={togglePadraoTemporal}
            />
          </EvolutionFormCard>

          <EvolutionFormCard
            title="Sintomas Associados"
            description="Como a dor afeta seu sono ou humor?"
          >
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Não consigo dormir direito, sinto náuseas..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              value={form.sintomasAssociados}
              onChangeText={(txt) => updateForm("sintomasAssociados", txt)}
            />
          </EvolutionFormCard>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Enviar Avaliação</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: DARK_TEXT,
  },
  textArea: { height: 90, paddingTop: 12, textAlignVertical: "top" },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  submitBtn: {
    backgroundColor: PRIMARY_BLUE,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
