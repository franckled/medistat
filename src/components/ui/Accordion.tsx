import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from "react-native";

import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

import { Icon } from "./Icon";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  title: string;
  subtitle?: string;
  icon: string;
  accent: string;
  defaultOpen?: boolean;
  testID?: string;
  children: React.ReactNode;
};

export function Accordion({
  title,
  subtitle,
  icon,
  accent,
  defaultOpen,
  testID,
  children,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [open, setOpen] = useState(!!defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  return (
    <View style={styles.card}>
      <Pressable testID={testID} onPress={toggle} style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: accent + "22" }]}>
          <Icon name={icon} size={24} color={accent} weight="duotone" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Icon name={open ? "CaretUp" : "CaretDown"} size={20} color={colors.muted} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: fontSize.lg,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
}));
