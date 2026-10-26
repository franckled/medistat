import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/src/components/ui/Icon";
import { CALCULATORS, CATEGORIES } from "@/src/calculators";
import { getFavoriteIds, getRecentCalculatorIds, getSavedResults, isResultHistoryEnabled, toggleFavorite, type SavedCalculationResult } from "@/src/utils/activity";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

export default function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recentResults, setRecentResults] = useState<SavedCalculationResult[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(false);

  const refreshActivity = useCallback(async () => {
    const [favorites, recent, history, enabled] = await Promise.all([
      getFavoriteIds(),
      getRecentCalculatorIds(),
      getSavedResults(),
      isResultHistoryEnabled(),
    ]);
    setFavoriteIds(favorites);
    setRecentIds(recent);
    setRecentResults(history.slice(0, 3));
    setHistoryEnabled(enabled);
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshActivity();
  }, [refreshActivity]));

  const query = search.trim().toLocaleLowerCase("fr-FR");
  const searchResults = query
    ? CALCULATORS.filter((calc) => {
        const category = CATEGORIES.find((item) => item.id === calc.category)?.label ?? "";
        return (calc.title + " " + calc.subtitle + " " + calc.description + " " + category)
          .toLocaleLowerCase("fr-FR").includes(query);
      }).slice(0, 6)
    : [];
  const favoriteCalculators = favoriteIds
    .map((id) => CALCULATORS.find((calc) => calc.id === id))
    .filter((calc) => calc !== undefined);
  const recentCalculators = recentIds
    .map((id) => CALCULATORS.find((calc) => calc.id === id))
    .filter((calc) => calc !== undefined)
    .slice(0, 4);

  const actions = [
    {
      key: "cours",
      title: "Explorer les méthodes",
      desc: "Des repères visuels pour comprendre les statistiques.",
      eyebrow: "APPRENDRE",
      icon: "BookOpen",
      accent: colors.info,
      route: "/cours",
    },
    {
      key: "calculs",
      title: "Lancer un calcul",
      desc: "Des résultats clairs, prêts à interpréter et à citer.",
      eyebrow: "ANALYSER",
      icon: "ChartBar",
      accent: colors.brandPrimary,
      route: "/calculs",
    },
    {
      key: "assistant",
      title: "Choisir le bon test",
      desc: "Un parcours guidé selon votre question et vos données.",
      eyebrow: "ÊTRE GUIDÉ",
      icon: "MagicWand",
      accent: colors.brandSecondary,
      route: "/assistant",
    },
  ] as const;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomChrome + spacing["2xl"] }}
      >
        <LinearGradient
          colors={[colors.brand, "#075A87", colors.brandPrimary, colors.info]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}
        >
          <View style={styles.orbTop} />
          <View style={styles.orbBottom} />
          <View style={styles.heroTopline}>
            <View style={styles.brandMark}>
              <Image source={require("../../assets/images/icon.png")} style={styles.brandLogo} contentFit="cover" transition={200} />
            </View>
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandName}>THOTIS</Text>
              <Text style={styles.brandCaption}>STATISTIQUES BIOMÉDICALES</Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>À vos côtés</Text>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>LA RECHERCHE, PLUS LISIBLE</Text>
            <Text style={styles.heroTitle}>Les statistiques,{"\n"}enfin plus simples.</Text>
            <Text style={styles.heroSubtitle}>
              Comprendre. Calculer. Décider. Des outils pour avancer sereinement dans vos projets biomédicaux.
            </Text>
          </View>

          <View style={styles.miniDashboard}>
            <View style={styles.miniDashboardTop}>
              <View>
                <Text style={styles.miniLabel}>VOTRE BOÎTE À OUTILS</Text>
                <Text style={styles.miniTitle}>De la question au résultat</Text>
              </View>
              <View style={styles.miniIcon}>
                <Icon name="ChartLineUp" size={23} color="#FFFFFF" weight="bold" />
              </View>
            </View>
            <View style={styles.chartRow}>
              {[28, 42, 34, 54, 66, 82, 70, 96].map((height, i) => (
                <View key={i} style={styles.chartColumnSlot}>
                  <View style={[styles.chartColumn, { height, opacity: 0.38 + i * 0.08 }]} />
                </View>
              ))}
            </View>
            <View style={styles.miniLegend}>
              <Icon name="CheckCircle" size={15} color="#8AF3E2" weight="fill" />
              <Text style={styles.miniLegendText}>Des méthodes expliquées pas à pas</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionHeadingText}>
              <Text style={styles.sectionEyebrow}>COMMENCER ICI</Text>
              <Text style={styles.sectionTitle}>Que souhaitez-vous faire ?</Text>
            </View>
            <Pressable testID="home-settings" accessibilityRole="button" accessibilityLabel="Réglages" onPress={() => router.push("/reglages" as never)} style={styles.settingsButton}>
              <Icon name="Gear" size={21} color={colors.brandSecondary} weight="bold" />
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Icon name="MagnifyingGlass" size={22} color={colors.brandPrimary} weight="bold" />
            <TextInput
              testID="home-calculator-search"
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un calcul, un test, un score…"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Rechercher un calcul, un test ou un score"
              returnKeyType="search"
              style={styles.searchInput}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Effacer la recherche">
                <Icon name="XCircle" size={20} color={colors.muted} weight="regular" />
              </Pressable>
            ) : null}
          </View>

          {search.trim().length > 0 ? (
            <View style={styles.searchResults}>
              <Text style={styles.smallSectionTitle}>{searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}</Text>
              {searchResults.length === 0 ? (
                <Text style={styles.emptySearch}>Aucun calcul ne correspond. Essayez un autre terme.</Text>
              ) : searchResults.map((calc) => {
                const isFavorite = favoriteIds.includes(calc.id);
                const accent = colors[calc.accent];
                return (
                  <View key={calc.id} style={styles.searchResult}>
                    <Pressable onPress={() => router.push(("/calculator/" + calc.id) as never)} style={styles.searchResultMain}>
                      <View style={[styles.searchResultIcon, { backgroundColor: accent + "18" }]}>
                        <Icon name={calc.icon} size={20} color={accent} weight="duotone" />
                      </View>
                      <View style={styles.searchResultText}>
                        <Text style={styles.activityTitle}>{calc.title}</Text>
                        <Text style={styles.activitySubtitle}>{calc.subtitle}</Text>
                      </View>
                      <Icon name="CaretRight" size={18} color={colors.muted} weight="bold" />
                    </Pressable>
                    <Pressable
                      testID={"favorite-" + calc.id}
                      onPress={() => { void toggleFavorite(calc.id).then(setFavoriteIds); }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      style={styles.favoriteButton}
                    >
                      <Icon name={isFavorite ? "Heart" : "HeartStraight"} size={21} color={isFavorite ? colors.error : colors.muted} weight={isFavorite ? "fill" : "regular"} />
                    </Pressable>
                  </View>
                );
              })}
              <Pressable onPress={() => router.push("/calculs" as never)} style={styles.openAllLink}>
                <Text style={styles.openAllText}>Voir tous les calculateurs</Text>
                <Icon name="ArrowRight" size={16} color={colors.brandPrimary} weight="bold" />
              </Pressable>
            </View>
          ) : null}

          {actions.map((action) => (
            <Pressable
              key={action.key}
              testID={`home-card-${action.key}`}
              onPress={() => router.push(action.route as never)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.cardPressed,
              ]}
            >
              <LinearGradient
                colors={[action.accent, action.accent + "CC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIcon}
              >
                <Icon name={action.icon} size={28} color="#FFFFFF" weight="duotone" />
              </LinearGradient>
              <View style={styles.actionText}>
                <Text style={[styles.actionEyebrow, { color: action.accent }]}>{action.eyebrow}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDesc}>{action.desc}</Text>
              </View>
              <View style={styles.arrowBubble}>
                <Icon name="ArrowUpRight" size={19} color={action.accent} weight="bold" />
              </View>
            </Pressable>
          ))}

          {favoriteCalculators.length > 0 ? (
            <View style={styles.activitySection}>
              <View style={styles.activityHeading}>
                <Text style={styles.smallSectionTitle}>Vos favoris</Text>
                <Icon name="Heart" size={18} color={colors.error} weight="fill" />
              </View>
              {favoriteCalculators.slice(0, 4).map((calc) => (
                <Pressable key={calc.id} onPress={() => router.push(("/calculator/" + calc.id) as never)} style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.error + "14" }]}>
                    <Icon name={calc.icon} size={20} color={colors.error} weight="duotone" />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{calc.title}</Text>
                    <Text style={styles.activitySubtitle}>{calc.subtitle}</Text>
                  </View>
                  <Icon name="CaretRight" size={18} color={colors.muted} weight="bold" />
                </Pressable>
              ))}
            </View>
          ) : null}

          {recentCalculators.length > 0 ? (
            <View style={styles.activitySection}>
              <View style={styles.activityHeading}>
                <Text style={styles.smallSectionTitle}>Derniers outils utilisés</Text>
                <Icon name="ClockCounterClockwise" size={18} color={colors.info} weight="duotone" />
              </View>
              {recentCalculators.map((calc) => (
                <Pressable key={calc.id} onPress={() => router.push(("/calculator/" + calc.id) as never)} style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.info + "18" }]}>
                    <Icon name={calc.icon} size={20} color={colors.info} weight="duotone" />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{calc.title}</Text>
                    <Text style={styles.activitySubtitle}>{calc.subtitle}</Text>
                  </View>
                  <Icon name="CaretRight" size={18} color={colors.muted} weight="bold" />
                </Pressable>
              ))}
            </View>
          ) : null}

          {historyEnabled && recentResults.length > 0 ? (
            <View style={styles.activitySection}>
              <View style={styles.activityHeading}>
                <Text style={styles.smallSectionTitle}>Résultats récents</Text>
                <Pressable onPress={() => router.push("/historique" as never)} style={styles.openAllLink}>
                  <Text style={styles.openAllText}>Tout voir</Text>
                  <Icon name="ArrowRight" size={15} color={colors.brandPrimary} weight="bold" />
                </Pressable>
              </View>
              {recentResults.map((entry) => (
                <Pressable key={entry.id} onPress={() => router.push("/historique" as never)} style={styles.activityRow}>
                  <View style={[styles.activityIcon, { backgroundColor: colors.brandPrimary + "18" }]}>
                    <Icon name="ChartBar" size={20} color={colors.brandPrimary} weight="duotone" />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{entry.calculatorTitle}</Text>
                    <Text style={styles.activitySubtitle}>{new Date(entry.savedAt).toLocaleString("fr-FR")}</Text>
                  </View>
                  <Icon name="CaretRight" size={18} color={colors.muted} weight="bold" />
                </Pressable>
              ))}
            </View>
          ) : null}

          <LinearGradient
            colors={[colors.surfaceSecondary, colors.surfaceTertiary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reassuranceCard}
          >
            <View style={styles.reassuranceIcon}>
              <Icon name="Lightbulb" size={23} color={colors.brand} weight="fill" />
            </View>
            <View style={styles.reassuranceCopy}>
              <Text style={styles.reassuranceTitle}>Pensé pour la recherche clinique</Text>
              <Text style={styles.reassuranceText}>
                Calculs hors ligne, explications pédagogiques et formulations utiles pour votre thèse.
              </Text>
            </View>
          </LinearGradient>

          <Pressable
            testID="home-apropos"
            onPress={() => router.push("/apropos")}
            style={({ pressed }) => [styles.aboutLink, pressed && styles.cardPressed]}
          >
            <Icon name="Info" size={18} color={colors.muted} weight="bold" />
            <Text style={styles.aboutText}>À propos de Thotis</Text>
            <Icon name="CaretRight" size={17} color={colors.muted} weight="bold" />
          </Pressable>

          <Pressable
            testID="home-about-settings"
            onPress={() => router.push("/reglages" as never)}
            style={({ pressed }) => [styles.aboutLink, pressed && styles.cardPressed]}
          >
            <Icon name="Gear" size={18} color={colors.muted} weight="bold" />
            <Text style={styles.aboutText}>Réglages et confidentialité</Text>
            <Icon name="CaretRight" size={17} color={colors.muted} weight="bold" />
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.copyright}>© Dr Franck LE DUFF</Text>
            <Text style={styles.footerNote}>Outil pédagogique — vérifiez toujours les conditions d’application des tests.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: {
    minHeight: 405,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["2xl"],
    gap: spacing.lg,
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  orbTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -110,
    right: -70,
    backgroundColor: "#FFFFFF",
    opacity: 0.08,
  },
  orbBottom: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    bottom: 85,
    left: -105,
    backgroundColor: "#7DF9E8",
    opacity: 0.11,
  },
  heroTopline: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandMark: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  brandLogo: { width: "100%", height: "100%" },
  brandTextWrap: { flex: 1, gap: 1 },
  brandName: { color: "#FFFFFF", fontFamily: fonts.extrabold, fontSize: 19, letterSpacing: 1.6 },
  brandCaption: { color: "#D4F7FF", fontFamily: fonts.bold, fontSize: 8, letterSpacing: 1.05 },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(5,25,55,0.25)",
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#8AF3E2" },
  onlineText: { fontFamily: fonts.bold, fontSize: 11, color: "#FFFFFF" },
  heroCopy: { gap: spacing.sm, maxWidth: 340, marginTop: spacing.xs },
  heroKicker: { color: "#8AF3E2", fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 1.4 },
  heroTitle: { color: "#FFFFFF", fontFamily: fonts.extrabold, fontSize: 33, lineHeight: 38, letterSpacing: -0.4 },
  heroSubtitle: { color: "#E4F7FF", fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, maxWidth: 340 },
  miniDashboard: {
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: "rgba(4,26,57,0.36)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: spacing.sm,
  },
  miniDashboardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  miniLabel: { color: "#91E9ED", fontFamily: fonts.extrabold, fontSize: 9, letterSpacing: 1.2 },
  miniTitle: { color: "#FFFFFF", fontFamily: fonts.bold, fontSize: 14, marginTop: 3 },
  miniIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.13)" },
  chartRow: { height: 52, flexDirection: "row", alignItems: "flex-end", gap: 5, paddingTop: 3 },
  chartColumnSlot: { flex: 1, height: 50, alignItems: "center", justifyContent: "flex-end" },
  chartColumn: { width: "72%", maxWidth: 22, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: "#8AF3E2" },
  miniLegend: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniLegendText: { color: "#DDFBFA", fontFamily: fonts.semibold, fontSize: 11 },
  body: { padding: spacing.lg, gap: spacing.md },
  settingsButton: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandSecondary + "18", borderWidth: 1, borderColor: colors.brandSecondary + "30" },
  searchBox: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, minHeight: 54, borderRadius: radius.lg, backgroundColor: colors.surfaceTertiary, borderWidth: 1.5, borderColor: colors.border },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: spacing.md, fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.onSurface },
  searchResults: { padding: spacing.md, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.border },
  searchResult: { flexDirection: "row", alignItems: "center", gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingVertical: spacing.xs },
  searchResultMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  searchResultIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  searchResultText: { flex: 1, minWidth: 0, gap: 2 },
  favoriteButton: { padding: spacing.sm, alignItems: "center", justifyContent: "center" },
  emptySearch: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 20, paddingVertical: spacing.sm },
  activitySection: { padding: spacing.md, gap: spacing.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceTertiary },
  activityHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingBottom: spacing.xs },
  smallSectionTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  activityRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
  activityIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  activityText: { flex: 1, minWidth: 0, gap: 2 },
  activityTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.sm, color: colors.onSurface },
  activitySubtitle: { fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.muted, lineHeight: 17 },
  openAllLink: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: spacing.xs },
  openAllText: { fontFamily: fonts.extrabold, fontSize: fontSize.xs, color: colors.brandPrimary },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm, marginBottom: spacing.xs },
  sectionHeadingText: { flex: 1, gap: 3 },
  sectionEyebrow: { color: colors.brandPrimary, fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 1.3 },
  sectionTitle: { color: colors.onSurface, fontFamily: fonts.extrabold, fontSize: 22, lineHeight: 28 },
  sectionEmoji: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.brandTertiary + "25", alignItems: "center", justifyContent: "center" },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0C4067",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  actionIcon: { width: 58, height: 58, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1, gap: 2 },
  actionEyebrow: { fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 1 },
  actionTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.onSurface },
  actionDesc: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted, lineHeight: 18 },
  arrowBubble: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  reassuranceCard: { flexDirection: "row", gap: spacing.md, padding: spacing.lg, borderRadius: 20, marginTop: spacing.sm },
  reassuranceIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  reassuranceCopy: { flex: 1, gap: 4 },
  reassuranceTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.onSurface },
  reassuranceText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.onSurfaceSecondary, lineHeight: 19 },
  aboutLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.md, marginTop: spacing.xs },
  aboutText: { fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.muted },
  footer: { alignItems: "center", gap: spacing.xs, marginTop: spacing.sm, paddingHorizontal: spacing.sm },
  copyright: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.onSurface },
  footerNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.muted, textAlign: "center", lineHeight: 16 },
}));
