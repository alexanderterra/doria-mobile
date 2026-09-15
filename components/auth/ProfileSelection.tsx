import { PROFILE_OPTIONS } from "@/constants/auth/registration.constants";
import { UserType } from "@/types/auth/registration.types";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ProfileSelectionProps {
  selectedType: UserType;
  onSelectType: (type: UserType) => void;
}

export const ProfileSelection: React.FC<ProfileSelectionProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <View style={{ gap: 16 }}>
      {PROFILE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.type}
          activeOpacity={0.7}
          onPress={() => onSelectType(option.type)}
          style={{
            padding: 20,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: selectedType === option.type ? "#3B82F6" : "#F1F5F9",
            backgroundColor:
              selectedType === option.type ? "#EFF6FF" : "#FFFFFF",
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor:
                selectedType === option.type ? "#DBEAFE" : "#F8FAFC",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather
              name={option.icon as any}
              size={24}
              color={selectedType === option.type ? "#2563EB" : "#64748B"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#0F172A",
              }}
            >
              {option.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#64748B",
                marginTop: 2,
              }}
            >
              {option.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};
