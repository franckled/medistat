import { Pressable, Text } from "react-native";

import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  testID?: string;
};

export function Chip({ label, selected, onPress, color, testID }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const accent = color ?? colors.brandPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: accent, borderColor: accent }
          : { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.label, { color: selected ? "#FFFFFF" : colors.onSurfaceTertiary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  chip: {
    minHeight: 40,
    flexShrink: 0,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  label: { fontFamily: fonts.extrabold, fontSize: fontSize.sm },
}));
