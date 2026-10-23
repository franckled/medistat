import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

import { Icon } from "./Icon";

type Props = {
  title: string;
  subtitle?: string;
  back?: boolean;
  accent?: string;
  icon?: string;
};

export function Header({ title, subtitle, back, accent, icon }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tint = accent ?? colors.brandPrimary;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.md }]}>
      {back ? (
        <Pressable
          onPress={() => router.back()}
          testID="header-back"
          accessibilityRole="button"
          accessibilityLabel="Retour"
          style={[styles.iconTile, { backgroundColor: tint + "18", borderColor: tint + "30" }]}
          hitSlop={8}
        >
          <Icon name="ArrowLeft" size={22} color={tint} weight="bold" />
        </Pressable>
      ) : icon ? (
        <View style={[styles.iconTile, { backgroundColor: tint + "18", borderColor: tint + "30" }]}>
          <Icon name={icon} size={23} color={tint} weight="duotone" />
        </View>
      ) : null}
      <View style={styles.textWrap}>
        <Text style={styles.kicker}>THOTIS</Text>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, gap: 1 },
  kicker: { color: colors.brandPrimary, fontFamily: fonts.extrabold, fontSize: 9, letterSpacing: 1.6 },
  title: { fontFamily: fonts.extrabold, fontSize: fontSize.xl, color: colors.onSurface, letterSpacing: -0.3 },
  subtitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
}));
