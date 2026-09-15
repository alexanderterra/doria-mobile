import { clearAll, getUser } from "@/services/api/storage";
import { cancelWeeklyEvolutionNotification } from "@/services/notifications/assessmentNotifications";
import { cancelAllConsultationLocalNotifications } from "@/services/notifications/consultationsNotifications";
import { cancelDailyDiaryNotification } from "@/services/notifications/diaryNotifications";
import { cancelEspecialistaNotifications } from "@/services/notifications/especialistaNotifications";
import { cancelAllMedicationLocalNotifications } from "@/services/notifications/medicationNotifications";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextData {
  user: any;
  role: "paciente" | "especialista" | null;
  isLoadingAuth: boolean;
  updateAuthState: (userData: any) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const sanitizeRole = (rawRole: any): "paciente" | "especialista" | null => {
  if (!rawRole) return null;
  const cleanRole = String(rawRole).toLowerCase().trim();
  if (cleanRole === "especialista" || cleanRole === "paciente") {
    return cleanRole as "paciente" | "especialista";
  }
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"paciente" | "especialista" | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storagedUser = await getUser();
        if (storagedUser) {
          setUser(storagedUser);
          setRole(sanitizeRole(storagedUser.tipo || storagedUser.tipo_usuario));
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadStorageData();
  }, []);

  const updateAuthState = (userData: any) => {
    setUser(userData);
    setRole(sanitizeRole(userData?.tipo || userData?.tipo_usuario));
  };

  const signOut = async () => {
    await Promise.all([
      cancelDailyDiaryNotification(),
      cancelWeeklyEvolutionNotification(),
      cancelAllConsultationLocalNotifications(),
      cancelAllMedicationLocalNotifications(),
      cancelEspecialistaNotifications(),
    ]);
    await clearAll();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isLoadingAuth, updateAuthState, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
