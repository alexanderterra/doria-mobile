import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface CustomInputProps {
  label?: string;
  iconName: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "url";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  rightLabel?: string;
  onBlur?: () => void;
  onRightLabelPress?: () => void;
  editable?: boolean; 
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  iconName,
  placeholder,
  value,
  onChangeText,
  error,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  keyboardType = "default",
  autoCapitalize = "none",
  maxLength,
  rightLabel,
  onBlur,
  onRightLabelPress,
  editable = true, 
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {(label || rightLabel) && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
            marginLeft: 4,
          }}
        >
          {label && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#334155",
              }}
            >
              {label}
            </Text>
          )}

          {!label && <View style={{ flex: 1 }} />}

          {rightLabel && (
            <TouchableOpacity
              onPress={onRightLabelPress}
              disabled={!onRightLabelPress}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#3B82F6",
                }}
              >
                {rightLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: error ? "#EF4444" : isFocused ? "#3B82F6" : "#E2E8F0",
          borderRadius: 14,
          backgroundColor: editable ? "#FFFFFF" : "#F1F5F9",
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        <Feather
          name={iconName as any}
          size={20}
          color={
            error
              ? "#EF4444"
              : !editable
                ? "#CBD5E1"
                : isFocused
                  ? "#3B82F6"
                  : "#94A3B8"
          }
        />

        <TextInput
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 15,
            color: editable ? "#0F172A" : "#64748B",
            paddingVertical: 12,
          }}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable} 
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
        />

        {isPassword && onTogglePassword && (
          <TouchableOpacity onPress={onTogglePassword}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
