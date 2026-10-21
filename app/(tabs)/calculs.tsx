import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CALCULATORS, CATEGORIES } from "@/src/calculators";
import { Chip } from "@/src/components/ui/Chip";
import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

export default function CalculsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

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
        {list.map((calc) => {
          const accent = colors[calc.accent];
          return (
            <Pressable
              key={calc.id}
              testID={`calc-${calc.id}`}
              onPress={() => router.push(`/calculator/${calc.id}` as never)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
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
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
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
