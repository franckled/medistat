import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from "react-native";

import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

import { Icon } from "./Icon";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
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

export function Accordion({ title, subtitle, icon, accent, defaultOpen, testID, children }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [open, setOpen] = useState(!!defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  return (
    <View style={[styles.card, open && styles.cardOpen]}>
      <Pressable
        testID={testID}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <View style={[styles.iconBadge, { backgroundColor: accent + "1C", borderColor: accent + "25" }]}>
          <Icon name={icon} size={25} color={accent} weight="duotone" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={[styles.chevron, { backgroundColor: open ? accent : colors.surfaceSecondary }]}>
          <Icon name={open ? "CaretUp" : "CaretDown"} size={17} color={open ? "#FFFFFF" : colors.muted} weight="bold" />
        </View>
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
    shadowColor: "#0A3A65",
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardOpen: { borderColor: colors.brandPrimary + "70", backgroundColor: colors.surfaceTertiary },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  iconBadge: { width: 50, height: 50, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.extrabold, fontSize: fontSize.lg, color: colors.onSurface, lineHeight: 22 },
  subtitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
  chevron: { width: 30, height: 30, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
}));
