import { CustomInput } from "@/components/auth/CustomInput";
import { UserRole } from "@/types/profile";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIMARY_BLUE = "#3B82F6";

const maskDate = (val: string) =>
  val
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2")
    .slice(0, 10);

const maskPhone = (val: string) =>
  val
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2")
    .slice(0, 15);

const maskCPF = (val: string) =>
  val
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .slice(0, 14);

interface Props {
  role: UserRole;
  data: any;
  onChange: (field: any, value: string) => void;
  // Podemos passar uma prop extra ou apenas verificar se o dado inicial já existe
  isEmailLocked?: boolean;
  isCpfLocked?: boolean;
}

const SEXO_OPCOES = ["Feminino", "Masculino"];

export function StepDadosPessoais({
  role,
  data,
  onChange,
  isEmailLocked = true,
  isCpfLocked = true,
}: Props) {
  // Verifica se o CPF e Email já vieram preenchidos para bloquear a edição
  const hasEmail = !!data.email && data.email.length > 0;
  const hasCpf = !!data.cpf && data.cpf.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados Pessoais</Text>
      <Text style={styles.subtitle}>
        Confirme seus dados e complete o que falta.
      </Text>

      {role === "especialista" && (
        <View style={styles.privacyAlert}>
          <Feather name="lock" size={16} color="#059669" />
          <Text style={styles.privacyText}>
            Fique tranquilo. Seus dados pessoais (como CPF, data de nascimento e
            telefone particular) são sigilosos e{" "}
            <Text style={{ fontWeight: "700" }}>não ficarão visíveis</Text> para
            os pacientes.
          </Text>
        </View>
      )}

      <View style={styles.fields}>
        <CustomInput
          label="Nome completo"
          iconName="user"
          placeholder="Seu nome completo"
          value={data.nome}
          onChangeText={(v) => onChange("nome", v)}
          autoCapitalize="words"
        />

        <CustomInput
          label="E-mail"
          iconName={hasEmail && isEmailLocked ? "lock" : "mail"}
          placeholder="seu@email.com"
          value={data.email}
          onChangeText={(v) => onChange("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!hasEmail || !isEmailLocked}
        />

        <CustomInput
          label="CPF"
          iconName="lock" 
          placeholder="000.000.000-00"
          value={data.cpf ?? ""}
          onChangeText={(v) => onChange("cpf", maskCPF(v))}
          keyboardType="numeric"
          editable={false} 
        />

        <CustomInput
          label="Data de nascimento"
          iconName="calendar"
          placeholder="DD/MM/AAAA"
          value={data.dataNascimento}
          onChangeText={(v) => onChange("dataNascimento", maskDate(v))}
          keyboardType="numeric"
        />

        <CustomInput
          label="Telefone Pessoal"
          iconName="smartphone"
          placeholder="(00) 00000-0000"
          value={data.telefone}
          onChangeText={(v) => onChange("telefone", maskPhone(v))}
          keyboardType="phone-pad"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sexo Biológico</Text>
          <View style={styles.chipsRow}>
            {SEXO_OPCOES.map((opcao) => {
              const isActive = data.sexoBiologico === opcao;
              return (
                <TouchableOpacity
                  key={opcao}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => onChange("sexoBiologico", opcao)}
                >
                  <Text
                    style={[styles.chipText, isActive && styles.chipTextActive]}
                  >
                    {opcao}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {role === "paciente" && (
          <CustomInput
            label="Profissão"
            iconName="briefcase"
            placeholder="Ex: Engenharia, Saúde, Educação..."
            value={data.areaAtuacao ?? ""}
            onChangeText={(v) => onChange("areaAtuacao", v)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 24 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  privacyAlert: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 20,
    gap: 10,
    alignItems: "flex-start",
  },
  privacyText: { flex: 1, fontSize: 13, color: "#065F46", lineHeight: 18 },
  fields: { gap: 4 },

  inputGroup: { marginBottom: 16, marginTop: 4 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 4,
  },
  chipsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 8 },
  chip: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  chipActive: { backgroundColor: "#EFF6FF", borderColor: PRIMARY_BLUE },
  chipText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  chipTextActive: { color: PRIMARY_BLUE, fontWeight: "700" },
});
