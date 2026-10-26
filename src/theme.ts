import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import { storage } from "@/src/utils/storage";

export type ColorScheme = "light" | "dark";
export type ThemePreference = "system" | ColorScheme;

const THEME_PREFERENCE_KEY = "thotis.theme-preference.v1";

const light = {
  surface: "#F3F8FD",
  onSurface: "#10233F",
  surfaceSecondary: "#E8F6FB",
  onSurfaceSecondary: "#10233F",
  surfaceTertiary: "#FFFFFF",
  onSurfaceTertiary: "#17324D",
  surfaceInverse: "#10233F",
  onSurfaceInverse: "#F8FCFF",
  muted: "#647B92",
  brand: "#0A3A65",
  onBrand: "#FFFFFF",
  brandPrimary: "#079DD7",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#5B5CE2",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#FFBF47",
  onBrandTertiary: "#17324D",
  success: "#0CA88A",
  onSuccess: "#FFFFFF",
  warning: "#E99B17",
  onWarning: "#172B43",
  error: "#E64F68",
  onError: "#FFFFFF",
  info: "#15B8B5",
  onInfo: "#FFFFFF",
  border: "#D9E7F2",
  borderStrong: "#B8D3E5",
  divider: "#E4EEF5",
};

const dark: typeof light = {
  surface: "#091725",
  onSurface: "#F0F6FC",
  surfaceSecondary: "#142B3D",
  onSurfaceSecondary: "#E4EFF9",
  surfaceTertiary: "#102438",
  onSurfaceTertiary: "#E4EFF9",
  surfaceInverse: "#F3F8FD",
  onSurfaceInverse: "#10233F",
  muted: "#A1B5C8",
  brand: "#0B3557",
  onBrand: "#FFFFFF",
  brandPrimary: "#35BDEB",
  onBrandPrimary: "#062033",
  brandSecondary: "#A3A0FF",
  onBrandSecondary: "#17153D",
  brandTertiary: "#FFD071",
  onBrandTertiary: "#25200E",
  success: "#38D6B3",
  onSuccess: "#062C22",
  warning: "#FFC15B",
  onWarning: "#332307",
  error: "#FF8295",
  onError: "#330D17",
  info: "#40D8D3",
  onInfo: "#063331",
  border: "#2B4358",
  borderStrong: "#405F77",
  divider: "#233B50",
};

export type ThemeColors = typeof light;
export const themes: Record<ColorScheme, ThemeColors> = { light, dark };

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  ready: boolean;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue>({
  preference: "system",
  ready: false,
  setPreference: async () => {},
});

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void storage.getItem(THEME_PREFERENCE_KEY, "system").then((saved) => {
      if (!active) return;
      setPreferenceState(isThemePreference(saved) ? saved : "system");
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setColorScheme(preference === "system" ? null : preference);
  }, [preference]);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await storage.setItem(THEME_PREFERENCE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ preference, ready, setPreference }),
    [preference, ready, setPreference],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const { preference } = useThemePreference();
  const scheme: ColorScheme =
    preference === "system" ? (system === "dark" ? "dark" : "light") : preference;
  return { scheme, colors: themes[scheme] };
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function makeStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
