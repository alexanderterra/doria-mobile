export type UserType = 'paciente' | 'especialista' | null;

export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  cpf: string;
}

export interface RegistrationStep {
  id: 1 | 2;
  title: string;
  subtitle: string;
}

export interface ProfileOption {
  type: UserType;
  title: string;
  description: string;
  icon: string;
}