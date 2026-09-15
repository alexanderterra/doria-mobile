import {
  ProfileOption,
  RegistrationStep,
} from "@/types/auth/registration.types";

export const REGISTRATION_STEPS: Record<number, RegistrationStep> = {
  1: {
    id: 1,
    title: "Qual é o seu perfil?",
    subtitle:
      "Precisamos saber quem você é para personalizar sua experiência no Dor.ia.",
  },
  2: {
    id: 2,
    title: "Crie sua conta",
    subtitle: "Preencha seus dados para iniciar seu tratamento.",
  },
};

export const PROFILE_OPTIONS: ProfileOption[] = [
  {
    type: "paciente",
    title: "Sou Paciente",
    description: "Quero gerenciar minha dor crônica.",
    icon: "user",
  },
  {
    type: "especialista",
    title: "Profissional da Saúde",
    description: "Espaço dedicado para profissionais da saúde.",
    icon: "award",
  },
];
