import { InfoTooltip } from "@/components/common/InfoTooltip";
import { ESTADOS_UF } from "@/constants/professions";
import { professionsService } from "@/services/professions/professionsService";
import { Conselho, Profissao } from "@/types/professions";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";

interface Specialty {
  name: string;
  register: string | null;
}

interface ProfessionalIdentityProps {
  data: any;
  cpf?: string;
  onChange: (field: string, value: any) => void;
}

export function ProfessionalIdentityForm({
  data,
  cpf,
  onChange,
}: ProfessionalIdentityProps) {
  const [modalProfissao, setModalProfissao] = useState(false);
  const [modalUF, setModalUF] = useState(false);

  const [isVerifyingSbed, setIsVerifyingSbed] = useState(false);
  const [modalSbedError, setModalSbedError] = useState(false);

  const [professions, setProfessions] = useState<Profissao[]>([]);
  const [councils, setCouncils] = useState<Conselho[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingCatalog(true);
      const [profissoesResult, conselhosResult] = await Promise.all([
        professionsService.getProfissoes(),
        professionsService.getConselhos(),
      ]);

      if (conselhosResult.success && conselhosResult.data) {
        setCouncils(conselhosResult.data);
      }

      // Falha em conselhos degrada silenciosamente (só afeta o pré-preenchimento e o
      // selo de validação automática) — só bloqueia a seleção se as profissões falharem.
      if (profissoesResult.success && profissoesResult.data) {
        setProfessions(profissoesResult.data);
        setCatalogError(null);
      } else {
        setCatalogError(
          profissoesResult.message || "Não foi possível carregar as profissões.",
        );
      }

      setLoadingCatalog(false);
    };

    fetchCatalog();
  }, []);

  const specialties: Specialty[] = Array.isArray(data.especialidades)
    ? data.especialidades
    : [];

  const handleSelectProfession = (item: Profissao) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange("profissao", item.nome);
    onChange("conselhoTipo", item.conselho_padrao || "");
    setModalProfissao(false);
  };

  const handleAddSpecialty = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange("especialidades", [...specialties, { name: "", register: null }]);
  };

  const handleUpdateSpecialty = (
    index: number,
    field: keyof Specialty,
    value: string,
  ) => {
    const newSpecialties = [...specialties];
    newSpecialties[index] = { ...newSpecialties[index], [field]: value };
    onChange("especialidades", newSpecialties);
  };

  const handleRemoveSpecialty = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newSpecialties = specialties.filter((_, i) => i !== index);
    onChange("especialidades", newSpecialties);
  };

  const handleSbedSelection = async (isSbed: boolean) => {
    if (!isSbed) {
      onChange("especialistaSbed", false);
      return;
    }

    const currentCpf = cpf || data.cpf;

    if (!currentCpf) {
      Alert.alert(
        "Aviso",
        "CPF não encontrado. Por favor, volte, preencha e salve a etapa de Dados Pessoais primeiro.",
      );
      onChange("especialistaSbed", false);
      return;
    }

    setIsVerifyingSbed(true);

    try {
      const response = await fetch(
        "https://api.falecomadoria.com.br/certificar_especialista_sbed",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cpf: currentCpf }),
        },
      );

      const result = await response.json();

      switch (response.status) {
        case 200:
          onChange("especialistaSbed", true);
          break;

        case 404:
          onChange("especialistaSbed", false);
          setModalSbedError(true);
          break;

        case 409:
          Alert.alert(
            "Aviso",
            "Este CPF já foi validado como especialista SBED anteriormente.",
          );
          onChange("especialistaSbed", false);
          break;

        case 403:
          Alert.alert(
            "Acesso Negado",
            "O CPF informado não corresponde ao usuário autenticado.",
          );
          onChange("especialistaSbed", false);
          break;

        case 401:
        case 440:
          Alert.alert(
            "Sessão Inválida",
            "Sua sessão expirou. Por favor, faça login novamente.",
          );
          onChange("especialistaSbed", false);
          break;

        default:
          Alert.alert(
            "Erro",
            result.message || "Ocorreu um erro ao verificar sua certificação.",
          );
          onChange("especialistaSbed", false);
          break;
      }
    } catch (error) {
      Alert.alert(
        "Erro de Conexão",
        "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      );
      onChange("especialistaSbed", false);
    } finally {
      setIsVerifyingSbed(false);
    }
  };

  const showCustomProfession = data.profissao === "Outra";
  const isSupportedCouncil = councils.some(
    (c) => c.sigla === data.conselhoTipo && c.validacao_automatica,
  );
  const isCRF = data.conselhoTipo === "CRF";

  const isMedico =
    data.conselhoTipo === "CRM" ||
    (data.profissao && data.profissao.toLowerCase().includes("médic"));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Identidade Profissional</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sua Profissão</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => setModalProfissao(true)}
        >
          <Text
            style={[styles.selectText, !data.profissao && { color: "#94A3B8" }]}
          >
            {data.profissao || "Selecione sua profissão"}
          </Text>
          <Feather name="chevron-down" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {showCustomProfession && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Qual é a sua profissão?</Text>
          <TextInput
            style={styles.input}
            value={data.profissaoCustomizada}
            onChangeText={(val) => onChange("profissaoCustomizada", val)}
            placeholder="Digite sua profissão"
          />
        </View>
      )}

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Conselho</Text>
            <InfoTooltip
              title="Órgão Regulador"
              description="Preenchido automaticamente com base na profissão, mas você pode editar se precisar."
            />
          </View>
          <TextInput
            style={styles.input}
            value={data.conselhoTipo}
            onChangeText={(val) => onChange("conselhoTipo", val.toUpperCase())}
            placeholder="Ex: CRM"
            autoCapitalize="characters"
          />
        </View>

        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Estado (UF)</Text>
          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setModalUF(true)}
          >
            <Text
              style={[
                styles.selectText,
                !data.conselhoUF && { color: "#94A3B8" },
              ]}
            >
              {data.conselhoUF || "UF"}
            </Text>
            <Feather name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Número do Registro</Text>
        <TextInput
          style={styles.input}
          value={data.conselhoNumero}
          onChangeText={(val) => onChange("conselhoNumero", val)}
          placeholder="Ex: 123456"
          keyboardType="default"
        />
      </View>

      {isCRF && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cidade do Registro (Obrigatório)</Text>
          <TextInput
            style={styles.input}
            value={data.conselhoCidade}
            onChangeText={(val) => onChange("conselhoCidade", val)}
            placeholder="Ex: São Paulo"
          />
        </View>
      )}

      {isSupportedCouncil && (
        <View style={styles.verificationBadge}>
          <Feather name="shield" size={16} color="#059669" />
          <Text style={styles.verificationText}>
            Este conselho será validado automaticamente pelo sistema
            Consultar.IO ao salvar.
          </Text>
        </View>
      )}

      <View style={[styles.inputGroup, { marginTop: 8 }]}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>É associado SBED?</Text>
          <InfoTooltip
            title="Associação SBED"
            description="Validação automática usando seu CPF cadastrado."
          />
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              data.especialistaSbed === true && styles.toggleBtnActive,
            ]}
            onPress={() => handleSbedSelection(true)}
            disabled={isVerifyingSbed}
          >
            {isVerifyingSbed ? (
              <ActivityIndicator
                size="small"
                color={data.especialistaSbed === true ? "#FFF" : PRIMARY_BLUE}
              />
            ) : (
              <Text
                style={[
                  styles.toggleBtnText,
                  data.especialistaSbed === true && styles.toggleBtnTextActive,
                ]}
              >
                Sim
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              data.especialistaSbed === false && styles.toggleBtnActive,
            ]}
            onPress={() => handleSbedSelection(false)}
            disabled={isVerifyingSbed}
          >
            <Text
              style={[
                styles.toggleBtnText,
                data.especialistaSbed === false && styles.toggleBtnTextActive,
              ]}
            >
              Não
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.specialtiesWrapper}>
        <View style={styles.labelRow}>
          <Text style={styles.sectionTitle}>Especialidades (Opcional)</Text>
          <InfoTooltip
            title="Especialidades"
            description="Adicione suas áreas de foco. Médicos devem inserir o número do registro (RQE)."
          />
        </View>
        {specialties.map((spec, index) => (
          <View key={index} style={styles.specialtyCard}>
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Especialidade</Text>
                <TextInput
                  style={styles.input}
                  value={spec.name}
                  onChangeText={(val) =>
                    handleUpdateSpecialty(index, "name", val)
                  }
                  placeholder={isMedico ? "Ex: Cardiologia" : "Ex: Acupuntura"}
                />
              </View>

              {isMedico && (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>RQE *</Text>
                  <TextInput
                    style={styles.input}
                    value={spec.register || ""}
                    onChangeText={(val) =>
                      handleUpdateSpecialty(index, "register", val)
                    }
                    placeholder="Obrigatório"
                    keyboardType="numeric"
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => handleRemoveSpecialty(index)}
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {specialties.length < 1 && (
          <TouchableOpacity style={styles.addBtn} onPress={handleAddSpecialty}>
            <Feather name="plus" size={18} color={PRIMARY_BLUE} />
            <Text style={styles.addBtnText}>Adicionar Especialidade</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={modalProfissao} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione sua Profissão</Text>
            {loadingCatalog ? (
              <ActivityIndicator
                size="large"
                color={PRIMARY_BLUE}
                style={{ marginVertical: 24 }}
              />
            ) : catalogError ? (
              <Text style={styles.modalDescription}>{catalogError}</Text>
            ) : (
              <FlatList
                data={professions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectProfession(item)}
                  >
                    <Text style={styles.modalItemText}>{item.nome}</Text>
                    {item.nome === data.profissao && (
                      <Feather name="check" size={20} color={PRIMARY_BLUE} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalProfissao(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalUF} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "60%" }]}>
            <Text style={styles.modalTitle}>Selecione o Estado (UF)</Text>
            <FlatList
              data={ESTADOS_UF}
              keyExtractor={(item) => item}
              numColumns={4}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: 12,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.ufItem,
                    data.conselhoUF === item && styles.ufItemActive,
                  ]}
                  onPress={() => {
                    onChange("conselhoUF", item);
                    setModalUF(false);
                  }}
                >
                  <Text
                    style={[
                      styles.ufText,
                      data.conselhoUF === item && styles.ufTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalUF(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={modalSbedError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { padding: 32, alignItems: "center" }]}
          >
            <View style={styles.errorIconCircle}>
              <Feather name="x" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Verificação Falhou</Text>
            <Text style={styles.modalDescription}>
              Não localizamos sua associação SBED vinculada ao CPF informado
              nos seus Dados Pessoais. Por favor, entre em contato com a equipe
              da SBED para mais informações.
            </Text>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => setModalSbedError(false)}
            >
              <Text style={styles.primaryActionText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: DARK_TEXT },
  inputGroup: { gap: 6 },
  rowInputs: { flexDirection: "row", gap: 12, alignItems: "flex-end" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#64748B", marginLeft: 4 },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: DARK_TEXT,
  },

  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  selectText: { fontSize: 15, color: DARK_TEXT, flex: 1 },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    height: 52,
  },
  toggleBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: PRIMARY_BLUE,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  toggleBtnTextActive: {
    color: "#FFFFFF",
  },

  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 8,
  },
  verificationText: { flex: 1, fontSize: 13, color: "#065F46", lineHeight: 18 },

  specialtiesWrapper: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  specialtyCard: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  trashBtn: {
    height: 52,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  addBtnText: { color: PRIMARY_BLUE, fontWeight: "700", fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 16,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalItemText: { fontSize: 16, color: DARK_TEXT },
  modalCloseBtn: { marginTop: 16, paddingVertical: 16, alignItems: "center" },
  modalCloseText: { fontSize: 16, color: "#EF4444", fontWeight: "700" },

  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryActionBtn: {
    backgroundColor: PRIMARY_BLUE,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryActionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  ufItem: {
    width: "22%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ufItemActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
  ufText: { fontSize: 16, fontWeight: "600", color: DARK_TEXT },
  ufTextActive: { color: "#FFF" },
});
