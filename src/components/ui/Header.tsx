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
    <View style={[styles.wrap, { paddingTop: insets.top + spacing.sm }]}>
      {back ? (
        <Pressable
          onPress={() => router.back()}
          testID="header-back"
          style={[styles.backBtn, { backgroundColor: tint + "18" }]}
          hitSlop={8}
        >
          <Icon name="ArrowLeft" size={22} color={tint} weight="bold" />
        </Pressable>
      ) : icon ? (
        <View style={[styles.backBtn, { backgroundColor: tint + "18" }]}>
          <Icon name={icon} size={22} color={tint} weight="duotone" />
        </View>
      ) : null}
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
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
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  title: { fontFamily: fonts.extrabold, fontSize: fontSize.xl, color: colors.onSurface },
  subtitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted },
}));
