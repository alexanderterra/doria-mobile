import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "doria_access_token";
const REFRESH_TOKEN_KEY = "doria_refresh_token";
const USER_KEY = "doria_user_data";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}
export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveRefreshToken(refreshToken: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}
export async function getRefreshToken() {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}
export async function deleteRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveUser(userData: any) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
}
export async function getUser() {
  const userString = await SecureStore.getItemAsync(USER_KEY);
  if (userString) {
    return JSON.parse(userString);
  }
  return null;
}
export async function deleteUser() {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function clearAll() {
  await Promise.all([deleteToken(), deleteRefreshToken(), deleteUser()]);
}

const DRAFT_KEY = "doria_profile_draft";

export async function saveProfileDraft(draftData: any) {
  await SecureStore.setItemAsync(DRAFT_KEY, JSON.stringify(draftData));
}
export async function getProfileDraft() {
  const draftString = await SecureStore.getItemAsync(DRAFT_KEY);
  return draftString ? JSON.parse(draftString) : null;
}
export async function clearProfileDraft() {
  await SecureStore.deleteItemAsync(DRAFT_KEY);
}
