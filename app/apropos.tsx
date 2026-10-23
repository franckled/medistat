import { Image } from "expo-image";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

const FEATURES = [
  { icon: "BookOpen", text: "Rappels des méthodes statistiques avec explications graphiques" },
  { icon: "Calculator", text: "Calculs d'échantillonnage, épidémiologiques et comparatifs (2 groupes, ANOVA, Kruskal-Wallis)" },
  { icon: "Waveform", text: "Critères de normalité et test de Levene" },
  { icon: "MagicWand", text: "Assistant pour choisir la bonne méthode statistique" },
  { icon: "FilePdf", text: "Résultats copiables, partageables et exportables en PDF" },
];

export default function AproposScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Header title="À propos" back accent={colors.brandPrimary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.logoBox}>
          <Image source={require("../assets/images/icon.png")} contentFit="cover" style={styles.logo} />
          <Text style={styles.appName}>THOTIS</Text>
          <Text style={styles.tagline}>Les statistiques biomédicales, en clair</Text>
        </View>

        <Text style={styles.sectionTitle}>Ce que fait l'application</Text>
        <View style={styles.card}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i > 0 && styles.featureDivider]}>
              <View style={styles.featureIcon}>
                <Icon name={f.icon} size={20} color={colors.brandPrimary} weight="duotone" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Avertissement</Text>
        <View style={styles.card}>
          <Text style={styles.disclaimer}>
            Cet outil est destiné à un usage pédagogique et d'aide à la décision méthodologique. Il ne
            remplace pas l'avis d'un statisticien ni la lecture critique des données. Vérifiez toujours
            les conditions d'application des tests.
          </Text>
        </View>

        <View style={styles.copyrightBox}>
          <Text style={styles.copyright}>Copyright © Dr Franck LE DUFF</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  logoBox: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontFamily: fonts.extrabold, fontSize: fontSize["2xl"], color: colors.onSurface, letterSpacing: 2 },
  tagline: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.muted },
  sectionTitle: {
    fontFamily: fonts.extrabold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  featureDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary + "18",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 20 },
  disclaimer: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 22 },
  copyrightBox: { alignItems: "center", gap: spacing.xs, marginTop: spacing.lg },
  copyright: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  version: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.muted },
}));
