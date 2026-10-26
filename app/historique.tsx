import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { makeStyles, useTheme } from "@/src/theme";
import { clearSavedResults, getSavedResults, removeSavedResult, type SavedCalculationResult } from "@/src/utils/activity";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

export default function HistoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [items, setItems] = useState<SavedCalculationResult[]>([]);

  const refresh = useCallback(async () => {
    setItems(await getSavedResults());
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const remove = async (id: string) => {
    await removeSavedResult(id);
    await refresh();
  };

  const clear = async () => {
    await clearSavedResults();
    setItems([]);
  };

  return (
    <View style={styles.screen}>
      <Header title="Historique des résultats" subtitle="Stockage local sur cet appareil" back icon="ClockCounterClockwise" accent={colors.info} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing["2xl"] }]}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Icon name="Tray" size={34} color={colors.brandPrimary} weight="duotone" /></View>
            <Text style={styles.emptyTitle}>Aucun résultat enregistré</Text>
            <Text style={styles.emptyText}>Activez l’enregistrement dans Réglages, puis effectuez un calcul. Les résultats déjà enregistrés pourront être supprimés ici.</Text>
            <Pressable onPress={() => router.push("/reglages" as never)} style={styles.linkRow}>
              <Text style={styles.linkText}>Ouvrir les réglages</Text>
              <Icon name="CaretRight" size={18} color={colors.brandPrimary} weight="bold" />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.introRow}>
              <Text style={styles.introText}>{items.length} résultat{items.length > 1 ? "s" : ""} conservé{items.length > 1 ? "s" : ""} sur l’appareil</Text>
              <Pressable onPress={() => void clear()} testID="clear-history" style={styles.clearButton}>
                <Icon name="Trash" size={16} color={colors.error} weight="bold" />
                <Text style={styles.clearText}>Tout effacer</Text>
              </Pressable>
            </View>
            {items.map((entry) => (
              <View key={entry.id} style={styles.card} testID="saved-result">
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}><Icon name="ChartBar" size={21} color={colors.brandPrimary} weight="duotone" /></View>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{entry.calculatorTitle}</Text>
                    <Text style={styles.cardDate}>{new Date(entry.savedAt).toLocaleString("fr-FR")}</Text>
                  </View>
                  <Pressable onPress={() => void remove(entry.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Supprimer ce résultat" style={styles.deleteOne}>
                    <Icon name="Trash" size={19} color={colors.muted} weight="regular" />
                  </Pressable>
                </View>
                <Text style={styles.resultTitle}>{entry.result.title}</Text>
                {entry.result.sections.flatMap((section) => section.metrics).slice(0, 4).map((metric, index) => (
                  <View key={metric.label + "-" + index} style={styles.metricRow}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                  </View>
                ))}
                <Text style={styles.interpretation}>{entry.result.interpretation}</Text>
              </View>
            ))}
          </>
        )}
        <Text style={styles.footer}>THOTIS · © Dr Franck LE DUFF</Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  empty: { alignItems: "center", padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceTertiary, gap: spacing.md, marginTop: spacing.lg },
  emptyIcon: { width: 66, height: 66, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceSecondary },
  emptyTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.xl, color: colors.onSurface, textAlign: "center" },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.muted, lineHeight: 22, textAlign: "center" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  linkText: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.brandPrimary },
  introRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  introText: { flex: 1, fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.muted },
  clearButton: { flexDirection: "row", alignItems: "center", gap: 5, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.error + "12" },
  clearText: { fontFamily: fonts.extrabold, fontSize: fontSize.xs, color: colors.error },
  card: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cardIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.brandPrimary + "18", alignItems: "center", justifyContent: "center" },
  cardTitleWrap: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  cardDate: { fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.muted },
  deleteOne: { padding: spacing.sm },
  resultTitle: { fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.brandPrimary, marginTop: spacing.xs },
  metricRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.divider },
  metricLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.onSurfaceSecondary },
  metricValue: { maxWidth: "48%", textAlign: "right", fontFamily: fonts.extrabold, fontSize: fontSize.sm, color: colors.onSurface },
  interpretation: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.muted, lineHeight: 19, marginTop: spacing.xs },
  footer: { textAlign: "center", fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.muted, marginTop: spacing.md },
}));
