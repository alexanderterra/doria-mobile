import { CustomInput } from "@/components/auth/CustomInput";
import { Endereco, UserRole } from "@/types/profile"; 
import { Feather } from "@expo/vector-icons"; 
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const maskCEP = (val: string) =>
  val
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);

interface Props {
  role: UserRole; 
  data: Endereco;
  onChange: (field: keyof Endereco, value: string) => void;
  onCepBlur: (cep: string) => void;
}

export function StepEnderecoPessoal({
  role,
  data,
  onChange,
  onCepBlur,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu Endereço</Text>
      <Text style={styles.subtitle}>Informe seu endereço pessoal.</Text>

      {role === "especialista" && (
        <View style={styles.privacyAlert}>
          <Feather name="lock" size={16} color="#059669" />
          <Text style={styles.privacyText}>
            Fique tranquilo. Seu endereço pessoal é sigiloso e{" "}
            <Text style={{ fontWeight: "700" }}>não ficará visível</Text> para
            os pacientes. O que aparece para eles é apenas o endereço da
            clínica.
          </Text>
        </View>
      )}

      <View style={styles.fields}>
        <CustomInput
          label="CEP"
          iconName="map-pin"
          placeholder="00000-000"
          value={data.cep}
          onChangeText={(v) => {
            const masked = maskCEP(v);
            onChange("cep", masked);
            if (masked.length === 9) onCepBlur(masked);
          }}
          keyboardType="numeric"
        />
        <CustomInput
          label="Rua / Logradouro"
          iconName="map"
          placeholder="Nome da rua"
          value={data.rua}
          onChangeText={(v) => onChange("rua", v)}
        />
        <View style={styles.row}>
          <View style={styles.rowShort}>
            <CustomInput
              label="Número"
              iconName="hash"
              placeholder="Nº"
              value={data.numero}
              onChangeText={(v) => onChange("numero", v)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowLong}>
            <CustomInput
              label="Complemento"
              iconName="home"
              placeholder="Apto, bloco..."
              value={data.complemento ?? ""}
              onChangeText={(v) => onChange("complemento", v)}
            />
          </View>
        </View>
        <CustomInput
          label="Bairro"
          iconName="map-pin"
          placeholder="Seu bairro"
          value={data.bairro}
          onChangeText={(v) => onChange("bairro", v)}
        />
        <View style={styles.row}>
          <View style={styles.rowLong}>
            <CustomInput
              label="Cidade"
              iconName="map-pin"
              placeholder="Sua cidade"
              value={data.cidade}
              onChangeText={(v) => onChange("cidade", v)}
            />
          </View>
          <View style={styles.rowShort}>
            <CustomInput
              label="Estado"
              iconName="map-pin"
              placeholder="UF"
              value={data.estado}
              onChangeText={(v) => onChange("estado", v)}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
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
  row: { flexDirection: "row", gap: 12 },
  rowShort: { flex: 1 },
  rowLong: { flex: 2 },
});
