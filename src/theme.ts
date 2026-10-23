// Core visual tokens for Thotis: crisp biomedical blue, turquoise, and playful accent colors.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // App surfaces
  surface: "#F3F8FD",
  onSurface: "#10233F",
  surfaceSecondary: "#E8F6FB",
  onSurfaceSecondary: "#10233F",
  surfaceTertiary: "#FFFFFF",
  onSurfaceTertiary: "#17324D",
  surfaceInverse: "#10233F",
  onSurfaceInverse: "#F8FCFF",
  muted: "#647B92",

  // Thotis brand — biomedical blue, cyan, and a lively violet/amber contrast
  brand: "#0A3A65",
  onBrand: "#FFFFFF",
  brandPrimary: "#079DD7",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#5B5CE2",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#FFBF47",
  onBrandTertiary: "#17324D",

  // Status and visualisation accents
  success: "#0CA88A",
  onSuccess: "#FFFFFF",
  warning: "#E99B17",
  onWarning: "#172B43",
  error: "#E64F68",
  onError: "#FFFFFF",
  info: "#15B8B5",
  onInfo: "#FFFFFF",

  // Borders and separators
  border: "#D9E7F2",
  borderStrong: "#B8D3E5",
  divider: "#E4EEF5",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;
export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

// Native system surfaces follow the scheme shipped by the application.
export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system === "dark" && themes.dark ? "dark" : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
