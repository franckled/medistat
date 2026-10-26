import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CALCULATORS, CATEGORIES } from "@/src/calculators";
import { Chip } from "@/src/components/ui/Chip";
import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { getFavoriteIds, toggleFavorite } from "@/src/utils/activity";

export default function CalculsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  useFocusEffect(useCallback(() => {
    let active = true;
    void getFavoriteIds().then((ids) => {
      if (active) setFavoriteIds(ids);
    });
    return () => { active = false; };
  }, []));

  const list = CALCULATORS.filter((c) => c.category === cat);

  return (
    <View style={styles.screen}>
      <Header title="Calculs statistiques" subtitle="Résultats prêts pour votre thèse" icon="Calculator" accent={colors.brandPrimary} />
      <View style={styles.chipRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContent}
        >
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              testID={`cat-${c.id}`}
              label={c.label}
              selected={cat === c.id}
              color={colors[c.accent]}
              onPress={() => setCat(c.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: bottomChrome + spacing.xl }]}
      >
        <View style={styles.listIntro}>
          <View style={styles.listIntroIcon}>
            <Icon name="ChartLineUp" size={25} color={colors.brandPrimary} weight="duotone" />
          </View>
          <View style={styles.listIntroText}>
            <Text style={styles.listIntroTitle}>À vous de jouer</Text>
            <Text style={styles.listIntroSubtitle}>
              {list.length} outil{list.length > 1 ? "s" : ""} dans « {CATEGORIES.find((c) => c.id === cat)?.label} »
            </Text>
          </View>
          <View style={styles.listIntroBadge}>
            <Icon name="Sparkle" size={18} color={colors.brandSecondary} weight="fill" />
          </View>
        </View>
        {list.map((calc) => {
          const accent = colors[calc.accent];
          return (
            <View key={calc.id} style={styles.card}>
              <Pressable
                testID={`calc-${calc.id}`}
                onPress={() => router.push(`/calculator/${calc.id}` as never)}
                style={({ pressed }) => [styles.cardMain, pressed && styles.cardPressed]}
                accessibilityRole="button"
              >
                <View style={[styles.icon, { backgroundColor: accent + "1A" }]}>
                  <Icon name={calc.icon} size={26} color={accent} weight="duotone" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{calc.title}</Text>
                  <Text style={styles.cardSub}>{calc.subtitle}</Text>
                </View>
                <Icon name="CaretRight" size={20} color={colors.muted} weight="bold" />
              </Pressable>
              <Pressable
                testID={`calc-favorite-${calc.id}`}
                onPress={() => { void toggleFavorite(calc.id).then(setFavoriteIds); }}
                accessibilityRole="button"
                accessibilityLabel={favoriteIds.includes(calc.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                style={styles.favoriteButton}
                hitSlop={8}
              >
                <Icon
                  name={favoriteIds.includes(calc.id) ? "Heart" : "HeartStraight"}
                  size={22}
                  color={favoriteIds.includes(calc.id) ? colors.error : colors.muted}
                  weight={favoriteIds.includes(calc.id) ? "fill" : "regular"}
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  listIntro: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, marginBottom: spacing.xs, borderRadius: radius.lg, backgroundColor: colors.surfaceSecondary },
  listIntroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  listIntroText: { flex: 1, gap: 3 },
  listIntroTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.lg, color: colors.onSurface },
  listIntroSubtitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 17 },
  listIntroBadge: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.brandSecondary + "18", alignItems: "center", justifyContent: "center" },
  chipRow: {
    height: 56,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  chipContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: "center" },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  cardMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.lg },
  favoriteButton: { padding: spacing.sm, alignItems: "center", justifyContent: "center" },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.lg, color: colors.onSurface },
  cardSub: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
}));
