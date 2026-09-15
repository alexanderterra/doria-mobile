import { UserType } from "@/types/auth/registration.types";
import { useState } from "react";

export const useRegistrationWizard = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<UserType>(null);

  const goToNextStep = () => {
    if (userType) setStep(2);
  };

  const goToPreviousStep = () => {
    setStep(1);
  };

  const canGoToNextStep = step === 1 && userType !== null;

  return {
    step,
    userType,
    setUserType,
    goToNextStep,
    goToPreviousStep,
    canGoToNextStep,
  };
};
