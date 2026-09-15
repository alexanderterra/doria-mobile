import { jwtDecode } from "jwt-decode";
import { getToken } from "./storage";

interface DoriaJwtPayload {
  sub: string;
}

export async function getAuthIdFromToken(): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const payload = jwtDecode<DoriaJwtPayload>(token);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
