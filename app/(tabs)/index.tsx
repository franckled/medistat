import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/src/components/ui/Icon";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

const HERO =
  "https://images.unsplash.com/photo-1720293592077-421afa9e257d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwzfHwzZCUyMGFic3RyYWN0JTIwbWVkaWNhbCUyMHNoYXBlcyUyMGNvbG9yZnVsfGVufDB8fHx8MTc5MDY3Mjg4OXww&ixlib=rb-4.1.0&q=85";

export default function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const cards = [
    {
      key: "cours",
      title: "Cours & rappels",
      desc: "IC, valeur p, puissance, régression, cas-témoins & cohortes",
      icon: "BookOpen",
      accent: colors.info,
      route: "/cours",
    },
    {
      key: "calculs",
      title: "Calculs statistiques",
      desc: "Échantillonnage, épidémiologie, normalité, comparaisons",
      icon: "Calculator",
      accent: colors.brandPrimary,
      route: "/calculs",
    },
    {
      key: "assistant",
      title: "Quel test choisir ?",
      desc: "Assistant guidé pour trouver la bonne méthode",
      icon: "MagicWand",
      accent: colors.brandSecondary,
      route: "/assistant",
    },
  ] as const;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
          <Image source={{ uri: HERO }} style={styles.heroImg} contentFit="cover" transition={300} />
          <LinearGradient
            colors={["transparent", "rgba(28,25,23,0.15)", "rgba(28,25,23,0.55)"]}
            style={styles.heroScrim}
          />
          <View style={styles.heroContent}>
            <View style={styles.pill}>
              <Icon name="Pulse" size={16} color={colors.onBrandPrimary} weight="bold" />
              <Text style={styles.pillText}>Statistiques biomédicales</Text>
            </View>
            <Text style={styles.heroTitle}>MediStat</Text>
            <Text style={styles.heroSubtitle}>
              Comprendre, calculer et choisir la bonne méthode — pour vos études et votre thèse.
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          {cards.map((c) => (
            <Pressable
              key={c.key}
              testID={`home-card-${c.key}`}
              onPress={() => router.push(c.route as never)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: c.accent + "14", borderColor: c.accent + "33" },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: c.accent }]}>
                <Icon name={c.icon} size={28} color="#FFFFFF" weight="duotone" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardDesc}>{c.desc}</Text>
              </View>
              <Icon name="CaretRight" size={22} color={c.accent} weight="bold" />
            </Pressable>
          ))}

          <Pressable
            testID="home-apropos"
            onPress={() => router.push("/apropos")}
            style={({ pressed }) => [styles.aproposRow, pressed && styles.cardPressed]}
          >
            <Icon name="Info" size={18} color={colors.muted} weight="bold" />
            <Text style={styles.aproposText}>À propos & mentions</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.copyright}>Copyright © Dr Franck LE DUFF</Text>
            <Text style={styles.footerNote}>Outil pédagogique — ne remplace pas un avis d'expert</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  hero: {
    height: 320,
    justifyContent: "flex-end",
    padding: spacing.xl,
  },
  heroImg: { ...StyleSheetAbsolute() },
  heroScrim: { ...StyleSheetAbsolute() },
  heroContent: { gap: spacing.sm },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  pillText: { color: colors.onBrandPrimary, fontFamily: fonts.extrabold, fontSize: fontSize.sm },
  heroTitle: { color: "#FFFFFF", fontFamily: fonts.extrabold, fontSize: fontSize["3xl"] },
  heroSubtitle: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: fontSize.base, lineHeight: 21, opacity: 0.95 },
  body: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.lg, color: colors.onSurface },
  cardDesc: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
  aproposRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  aproposText: { fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.muted },
  footer: { alignItems: "center", gap: spacing.xs, marginTop: spacing.md },
  copyright: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  footerNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.muted },
}));

function StyleSheetAbsolute() {
  return { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
}
