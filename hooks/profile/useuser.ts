import { getUser } from "@/services/api/storage";
import { profileService } from "@/services/profile/profileService";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

interface UserData {
  name: string;
  email: string;
  role: "paciente" | "especialista";
}

export function useUser() {
  const [user, setUser] = useState<UserData>({
    name: "Carregando...",
    email: "...",
    role: "paciente",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await profileService.getMe();

      if (response.success && response.data) {
        const rawRole =
          response.data.tipo_usuario || response.data.tipo || "paciente";
        const cleanRole = rawRole.trim().toLowerCase() as
          | "paciente"
          | "especialista";

        setUser({
          name: response.data.nome || "Usuário",
          email: response.data.email || "",
          role: cleanRole,
        });
      } else {
        const localUser = await getUser();
        if (localUser) {
          const rawLocalRole =
            localUser.tipo_usuario || localUser.tipo || "paciente";
          const cleanLocalRole = rawLocalRole.trim().toLowerCase() as
            | "paciente"
            | "especialista";

          setUser({
            name: localUser.nome || "Usuário",
            email: localUser.email || "",
            role: cleanLocalRole,
          });
        } else {
          setUser({ name: "Usuário", email: "", role: "paciente" });
        }
      }
    } catch (error) {
      setUser({ name: "Usuário", email: "", role: "paciente" });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  return { user, isLoading };
}
