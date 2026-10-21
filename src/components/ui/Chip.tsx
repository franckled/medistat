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
      style={[
        styles.chip,
        selected
          ? { backgroundColor: accent, borderColor: accent }
          : { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? colors.onBrandPrimary : colors.onSurfaceTertiary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  chip: {
    height: 36,
    flexShrink: 0,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: fontSize.base,
  },
}));
