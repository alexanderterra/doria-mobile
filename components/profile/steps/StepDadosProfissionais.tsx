import { InfoTooltip } from "@/components/common/InfoTooltip";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { ProfessionalIdentityForm } from "./IdentidadeProfissionalForm";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY_BLUE = "#3B82F6";
const DARK_TEXT = "#0F172A";
const PLACEHOLDER_COLOR = "#94A3B8";

const TIPOS_ATENDIMENTO = ["Presencial", "Online", "Híbrido"];
const TIPOS_CONSULTA = ["Particular", "Convênio", "Ambos"];
const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

const maskPhone = (val: string) =>
  val
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .slice(0, 15);

interface DiaHorario {
  dia: string;
  ativo: boolean;
  inicio: string;
  fim: string;
}

interface StepDadosProfissionaisProps {
  data: any;
  addressData: any;
  personalCpf?: string;
  onChange: (field: string, value: any) => void;
  onAddressChange: (field: string, value: string) => void;
  onCepBlur?: (cep: string) => void;
}

export function StepDadosProfissionais({
  data,
  addressData,
  personalCpf,
  onChange,
  onAddressChange,
  onCepBlur,
}: StepDadosProfissionaisProps) {
  const [modalHorarioVisible, setModalHorarioVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"inicio" | "fim" | null>(
    null,
  );
  const [tempTime, setTempTime] = useState(new Date());
  const [showSocials, setShowSocials] = useState(false);
  const [horariosTemp, setHorariosTemp] = useState<DiaHorario[]>([]);

  const conveniosRaw = Array.isArray(data.convenios) ? data.convenios : [];
  const convenios: string[] = Array.from(new Set(conveniosRaw)) as string[];

  const handleAddConvenio = () => {
    if (convenios.length >= 3) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange("convenios", [...convenios, ""]);
  };

  const handleUpdateConvenio = (index: number, val: string) => {
    const newConvenios = [...convenios];
    newConvenios[index] = val;
    onChange("convenios", newConvenios);
  };

  const handleRemoveConvenio = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newConvenios = convenios.filter((_, i) => i !== index);
    onChange("convenios", newConvenios);
  };

  const getInitialHorarios = (): DiaHorario[] => {
    if (data.horario) {
      try {
        return JSON.parse(data.horario);
      } catch (e) {}
    }
    return DIAS_SEMANA.map((dia) => ({
      dia,
      ativo: dia !== "Sábado" && dia !== "Domingo",
      inicio: "08:00",
      fim: "18:00",
    }));
  };

  const handleOpenHorarios = () => {
    setHorariosTemp(getInitialHorarios());
    setModalHorarioVisible(true);
  };

  const handleSaveHorarios = () => {
    onChange("horario", JSON.stringify(horariosTemp));
    setModalHorarioVisible(false);
  };

  const toggleDiaAtivo = (diaNome: string) =>
    setHorariosTemp((prev) =>
      prev.map((d) => (d.dia === diaNome ? { ...d, ativo: !d.ativo } : d)),
    );

  const handleOpenTimePicker = (diaNome: string, field: "inicio" | "fim") => {
    const diaObj = horariosTemp.find((d) => d.dia === diaNome);
    if (diaObj) {
      const [horas, minutos] = diaObj[field].split(":").map(Number);
      const dataAtual = new Date();
      dataAtual.setHours(horas, minutos, 0, 0);
      setTempTime(dataAtual);
    }
    setEditingDay(diaNome);
    setEditingField(field);
    setShowTimePicker(true);
  };

  const handleTimeChange = (date: Date) => {
    if (editingDay && editingField) {
      const formatado = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setHorariosTemp((prev) =>
        prev.map((d) =>
          d.dia === editingDay ? { ...d, [editingField]: formatado } : d,
        ),
      );
    }
  };

  const toggleSocials = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSocials(!showSocials);
  };

  const hasHorariosDefinidos = data.horario && data.horario.includes("ativo");
  const showConvenios =
    data.tipoConsulta === "Convênio" || data.tipoConsulta === "Ambos";

  return (
    <View style={styles.container}>
      <ProfessionalIdentityForm
        data={data}
        cpf={personalCpf}
        onChange={onChange}
      />

      <View style={styles.inputGroup}>
        <View style={styles.customLabelContainer}>
          <Text style={styles.label}>Mini-currículo (Bio)</Text>
          <InfoTooltip
            title="Sua História"
            description="Escreva um breve resumo da sua formação. Isso gera confiança no paciente."
          />
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={data.miniCurriculo}
          onChangeText={(val) => onChange("miniCurriculo", val)}
          placeholder="Conte um pouco sobre sua experiência profissional..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>
          {data.miniCurriculo ? data.miniCurriculo.length : 0}/500
        </Text>
      </View>

      <View style={styles.sectionDivider} />
      <Text style={styles.title}>Informações da Clínica</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome da Clínica / Consultório</Text>
        <TextInput
          style={styles.input}
          value={data.nomeClinica}
          onChangeText={(val) => onChange("nomeClinica", val)}
          placeholder="Ex: Clínica Vida e Saúde"
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>WhatsApp (Agendamento)</Text>
          <TextInput
            style={styles.input}
            value={data.telefoneClinica}
            onChangeText={(val) => onChange("telefoneClinica", maskPhone(val))}
            placeholder="(00) 00000-0000"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>E-mail da Clínica</Text>
          <TextInput
            style={styles.input}
            value={data.emailClinica}
            onChangeText={(val) => onChange("emailClinica", val)}
            placeholder="contato@clinica.com"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.customLabelContainer}>
          <Text style={styles.label}>Tipo de Atendimento</Text>
          <InfoTooltip
            title="Como você atende?"
            description="Define como você aparece nas sugestões da DOR.IA. Pacientes que buscam teleconsulta ou atendimento local verão sua disponibilidade baseada nesta escolha."
          />
        </View>
        <View style={styles.chipsRow}>
          {TIPOS_ATENDIMENTO.map((tipo) => {
            const isActive = data.tipoAtendimento === tipo;
            return (
              <TouchableOpacity
                key={tipo}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onChange("tipoAtendimento", tipo)}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {tipo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <View style={styles.customLabelContainer}>
          <Text style={styles.label}>Tipo de Consulta</Text>
          <InfoTooltip
            title="Modalidade de Pagamento"
            description="Informe se você atende convênios, consultas particulares ou ambos."
          />
        </View>
        <View style={styles.chipsRow}>
          {TIPOS_CONSULTA.map((tipo) => {
            const isActive = data.tipoConsulta === tipo;
            return (
              <TouchableOpacity
                key={tipo}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => {
                  onChange("tipoConsulta", tipo);
                  if (tipo === "Particular") onChange("convenios", []);
                }}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {tipo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {showConvenios && (
        <View style={styles.conveniosWrapper}>
          <Text style={styles.sectionTitle}>Convênios</Text>

          {convenios.map((conv, index) => (
            <View key={index} style={styles.convenioCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Nome do Convênio</Text>
                <TextInput
                  style={[styles.input, { marginTop: 4 }]}
                  value={conv}
                  onChangeText={(val) => handleUpdateConvenio(index, val)}
                  placeholder="Ex: Unimed"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                />
              </View>
              <TouchableOpacity
                style={[styles.trashBtn, { marginTop: 22 }]}
                onPress={() => handleRemoveConvenio(index)}
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {convenios.length < 3 && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAddConvenio}>
              <Feather name="plus" size={18} color={PRIMARY_BLUE} />
              <Text style={styles.addBtnText}>Adicionar Convênio</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.inputGroup}>
        <View style={styles.customLabelContainer}>
          <Text style={styles.label}>Horário de Atendimento</Text>
        </View>
        <TouchableOpacity style={styles.pickerBox} onPress={handleOpenHorarios}>
          <Feather name="clock" size={20} color={PRIMARY_BLUE} />
          <Text
            style={[
              styles.pickerText,
              !hasHorariosDefinidos && { color: "#94A3B8" },
            ]}
          >
            {hasHorariosDefinidos
              ? "Horários configurados (Tocar para editar)"
              : "Tocar para definir horários"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionDivider} />
      <Text style={styles.title}>Endereço da Clínica</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CEP</Text>
        <TextInput
          style={styles.input}
          value={addressData.cep}
          onChangeText={(val) => onAddressChange("cep", val)}
          onBlur={() => onCepBlur && onCepBlur(addressData.cep)}
          placeholder="00000-000"
          placeholderTextColor={PLACEHOLDER_COLOR}
          keyboardType="numeric"
          maxLength={9}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.label}>Rua</Text>
          <TextInput
            style={styles.input}
            value={addressData.rua}
            onChangeText={(val) => onAddressChange("rua", val)}
            placeholder="Nome da rua"
            placeholderTextColor={PLACEHOLDER_COLOR}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={addressData.numero}
            onChangeText={(val) => onAddressChange("numero", val)}
            placeholder="123"
            placeholderTextColor={PLACEHOLDER_COLOR}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Complemento (Opcional)</Text>
        <TextInput
          style={styles.input}
          value={addressData.complemento}
          onChangeText={(val) => onAddressChange("complemento", val)}
          placeholder="Sala, Andar, Bloco"
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bairro</Text>
        <TextInput
          style={styles.input}
          value={addressData.bairro}
          onChangeText={(val) => onAddressChange("bairro", val)}
          placeholder="Bairro"
          placeholderTextColor={PLACEHOLDER_COLOR}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 2 }]}>
          <Text style={styles.label}>Cidade</Text>
          <TextInput
            style={styles.input}
            value={addressData.cidade}
            onChangeText={(val) => onAddressChange("cidade", val)}
            placeholder="Cidade"
            placeholderTextColor={PLACEHOLDER_COLOR}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Estado</Text>
          <TextInput
            style={styles.input}
            value={addressData.estado}
            onChangeText={(val) => onAddressChange("estado", val)}
            placeholder="UF"
            placeholderTextColor={PLACEHOLDER_COLOR}
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.socialAccordionContainer}>
        <TouchableOpacity
          style={styles.socialAccordionHeader}
          onPress={toggleSocials}
          activeOpacity={0.7}
        >
          <View style={styles.socialAccordionTitleRow}>
            <Feather name="share-2" size={18} color={PRIMARY_BLUE} />
            <Text style={styles.socialAccordionTitle}>
              Redes Sociais & Site (Opcional)
            </Text>
          </View>
          <Feather
            name={showSocials ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748B"
          />
        </TouchableOpacity>

        {showSocials && (
          <View style={styles.socialInputsWrapper}>
            <TextInput
              style={styles.input}
              value={data.siteClinica}
              onChangeText={(val) => onChange("siteClinica", val)}
              placeholder="Site: www.suaclinica.com.br"
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="url"
              autoCapitalize="none"
            />

            <View style={styles.socialInputBox}>
              <View
                style={[styles.socialIconBg, { backgroundColor: "#FFE4E6" }]}
              >
                <Feather name="instagram" size={18} color="#E1306C" />
              </View>
              <TextInput
                style={styles.socialInput}
                value={data.instagram}
                onChangeText={(val) => onChange("instagram", val)}
                placeholder="@seu.instagram"
                placeholderTextColor={PLACEHOLDER_COLOR}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialInputBox}>
              <View
                style={[styles.socialIconBg, { backgroundColor: "#DBEAFE" }]}
              >
                <Feather name="facebook" size={18} color="#1877F2" />
              </View>
              <TextInput
                style={styles.socialInput}
                value={data.facebook}
                onChangeText={(val) => onChange("facebook", val)}
                placeholder="facebook.com/suapagina"
                placeholderTextColor={PLACEHOLDER_COLOR}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.socialInputBox}>
              <View
                style={[styles.socialIconBg, { backgroundColor: "#E8F4FD" }]}
              >
                <Feather name="linkedin" size={18} color="#0A66C2" />
              </View>
              <TextInput
                style={styles.socialInput}
                value={data.linkedin}
                onChangeText={(val) => onChange("linkedin", val)}
                placeholder="linkedin.com/in/seu-perfil"
                placeholderTextColor={PLACEHOLDER_COLOR}
                autoCapitalize="none"
              />
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.termoContainer,
          !data.termoAceito && {
            borderColor: "#FECACA",
            backgroundColor: "#FEF2F2",
          },
        ]}
      >
        <Switch
          value={data.termoAceito || false}
          onValueChange={(val) => onChange("termoAceito", val)}
          trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
          thumbColor={data.termoAceito ? PRIMARY_BLUE : "#FFFFFF"}
          style={Platform.OS === "android" ? styles.switchAndroid : undefined}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.termoText,
              !data.termoAceito && { color: "#991B1B" },
            ]}
          >
            Declaro que minhas informações de registro profissional são
            verdadeiras. Estou ciente de que a DOR.IA não se responsabiliza por
            dados inverídicos e poderá validá-los junto aos órgãos competentes.
          </Text>
          {!data.termoAceito && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 12,
                fontWeight: "700",
                marginTop: 4,
              }}
            >
              * Aceite obrigatório para continuar
            </Text>
          )}
        </View>
      </View>

      <Modal
        visible={modalHorarioVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalHorarioVisible(false)}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setModalHorarioVisible(false)}
            style={styles.modalCloseBtn}
          >
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Horários</Text>
          <TouchableOpacity
            onPress={handleSaveHorarios}
            style={styles.modalCloseBtn}
          >
            <Text
              style={[
                styles.modalCancelText,
                { fontWeight: "700", textAlign: "right" },
              ]}
            >
              Salvar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalSubtitle}>
            Configure os horários de funcionamento. Desative os dias em que não
            houver atendimento.
          </Text>
          {horariosTemp.map((diaObj) => (
            <View key={diaObj.dia} style={styles.diaContainer}>
              <View style={styles.diaHeaderRow}>
                <Text
                  style={[
                    styles.diaTitle,
                    !diaObj.ativo && styles.diaTitleInativo,
                  ]}
                >
                  {diaObj.dia}
                </Text>
                <Switch
                  value={diaObj.ativo}
                  onValueChange={() => toggleDiaAtivo(diaObj.dia)}
                  trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                  thumbColor={diaObj.ativo ? PRIMARY_BLUE : "#FFFFFF"}
                  style={
                    Platform.OS === "android" ? styles.switchAndroid : undefined
                  }
                />
              </View>
              {diaObj.ativo ? (
                <View style={styles.horasRow}>
                  <View style={styles.horaBox}>
                    <Text style={styles.horaLabel}>Abertura</Text>
                    <TouchableOpacity
                      style={styles.horaBtn}
                      onPress={() => handleOpenTimePicker(diaObj.dia, "inicio")}
                    >
                      <Text style={styles.horaBtnText}>{diaObj.inicio}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.horaSeparator}>até</Text>
                  <View style={styles.horaBox}>
                    <Text style={styles.horaLabel}>Fechamento</Text>
                    <TouchableOpacity
                      style={styles.horaBtn}
                      onPress={() => handleOpenTimePicker(diaObj.dia, "fim")}
                    >
                      <Text style={styles.horaBtnText}>{diaObj.fim}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.fechadoBox}>
                  <Text style={styles.fechadoText}>
                    Sem atendimento neste dia
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {showTimePicker && (
          <Modal transparent animationType="fade">
            <View style={styles.masterCalendarOverlay}>
              <View style={styles.masterCalendarPopup}>
                {Platform.OS === "ios" && (
                  <View style={styles.masterCalendarHeader}>
                    <Text style={styles.modalTitle}>Definir Horário</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.modalCancelText}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={{ alignItems: "center", width: "100%" }}>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    themeVariant="light"
                    locale="pt-BR"
                    onChange={(event, date) => {
                      if (event.type === "dismissed") {
                        setShowTimePicker(false);
                        return;
                      }
                      if (Platform.OS === "android") {
                        setShowTimePicker(false);
                      }
                      if (date) {
                        handleTimeChange(date);
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: DARK_TEXT },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK_TEXT,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionDivider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  rowInputs: { flexDirection: "row", gap: 12 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#64748B", marginLeft: 4 },
  customLabelContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
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
  textArea: { height: 100, paddingTop: 16, paddingBottom: 16, lineHeight: 22 },

  chipsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 4 },
  chip: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  chipActive: { backgroundColor: "#EFF6FF", borderColor: PRIMARY_BLUE },
  chipText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  chipTextActive: { color: PRIMARY_BLUE, fontWeight: "700" },

  pickerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    gap: 10,
    marginTop: 4,
  },
  pickerText: { fontSize: 15, color: DARK_TEXT, flex: 1 },

  conveniosWrapper: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  convenioCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
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

  socialAccordionContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginTop: 8,
  },
  socialAccordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFF",
  },
  socialAccordionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  socialAccordionTitle: { fontSize: 15, fontWeight: "700", color: DARK_TEXT },
  socialInputsWrapper: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
    backgroundColor: "#FFF",
  },
  socialInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 50,
    paddingHorizontal: 12,
    gap: 10,
  },
  socialIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  socialInput: { flex: 1, fontSize: 15, color: DARK_TEXT },

  termoContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  termoText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 18 },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalCancelText: { fontSize: 16, color: PRIMARY_BLUE, fontWeight: "600" },
  modalCloseBtn: { width: 80 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: DARK_TEXT },
  modalContent: { padding: 20, paddingBottom: 60, backgroundColor: "#F8FAFC" },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 20,
  },
  diaContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  diaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diaTitle: { fontSize: 16, fontWeight: "700", color: DARK_TEXT },
  diaTitleInativo: { color: "#94A3B8" },
  horasRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 16,
  },
  horaBox: { flex: 1 },
  horaLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  horaBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  horaBtnText: { fontSize: 16, fontWeight: "700", color: PRIMARY_BLUE },
  horaSeparator: {
    marginHorizontal: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  fechadoBox: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  fechadoText: { fontSize: 14, color: "#64748B", fontWeight: "600" },

  masterCalendarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  masterCalendarPopup: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    width: "90%",
    maxWidth: 360,
  },
  masterCalendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 16,
    marginBottom: 16,
  },
  charCount: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 2,
    marginRight: 4,
    fontWeight: "500",
  },
  switchAndroid: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});
