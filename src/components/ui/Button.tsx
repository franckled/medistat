import { ActivityIndicator, Pressable, Text, ViewStyle } from "react-native";

import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "tertiary" | "outline";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  testID,
  style,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  const bg: Record<Variant, string> = {
    primary: colors.brandPrimary,
    secondary: colors.brandSecondary,
    tertiary: colors.brandTertiary,
    outline: "transparent",
  };
  const fg: Record<Variant, string> = {
    primary: colors.onBrandPrimary,
    secondary: colors.onBrandSecondary,
    tertiary: colors.onBrandTertiary,
    outline: colors.onSurface,
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        variant === "outline" && styles.outline,
        variant === "primary" && styles.primaryShadow,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={20} color={fg[variant]} weight="bold" /> : null}
          <Text style={[styles.label, { color: fg[variant] }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 3,
    paddingHorizontal: spacing.xl,
    minHeight: 54,
  },
  primaryShadow: {
    shadowColor: colors.brandPrimary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  outline: { borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surfaceTertiary },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  label: { fontFamily: fonts.extrabold, fontSize: fontSize.lg, letterSpacing: 0.1 },
}));
