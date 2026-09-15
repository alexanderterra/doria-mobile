import {
  validateCPF,
  validateEmail,
  validateName,
  validatePassword,
} from "@/utils/validators/registrationValidators";
import { useState } from "react";

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  [key: string]: any;
}

type FormErrors = Partial<Record<keyof RegistrationFormData, string>>;

export const useRegistrationForm = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    password: "",
    cpf: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (userType: "paciente" | "especialista"): boolean => {
    const newErrors: FormErrors = {};

    if (!validateName(formData.name)) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (userType === "especialista") {
      if (!validateCPF(formData.cpf)) {
        newErrors.cpf = "CPF inválido";
      }

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    showPassword,
    errors,
    updateField,
    setShowPassword,
    validateForm,
  };
};
