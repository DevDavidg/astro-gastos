import type { UserPreferences } from "../types/userPreferences";

const PREFERENCES_KEY = "user_preferences";

export const defaultPreferences: UserPreferences = {
  currency: "USD",
  theme: "light",
  language: "es",
};

export const getUserPreferences = (): UserPreferences => {
  if (typeof window === "undefined") return defaultPreferences;

  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (!stored) {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(defaultPreferences));
    return defaultPreferences;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return defaultPreferences;
  }
};

export const updateUserPreferences = (
  preferences: Partial<UserPreferences>
): UserPreferences => {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  return updated;
};
