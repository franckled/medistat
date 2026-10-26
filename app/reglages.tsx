import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { makeStyles, useTheme, useThemePreference, type ThemePreference } from "@/src/theme";
import { isResultHistoryEnabled, setResultHistoryEnabled } from "@/src/utils/activity";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

const OPTIONS: { value: ThemePreference; label: string; detail: string; icon: string }[] = [
  { value: "system", label: "Automatique", detail: "Suit le thème de l’appareil", icon: "Desktop" },
  { value: "light", label: "Clair", detail: "Interface lumineuse", icon: "Sun" },
  { value: "dark", label: "Sombre", detail: "Interface adaptée à la faible luminosité", icon: "Moon" },
];

export default function SettingsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { preference, setPreference } = useThemePreference();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [historyEnabled, setHistoryEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    void isResultHistoryEnabled().then((enabled) => {
      if (active) setHistoryEnabled(enabled);
    });
    return () => { active = false; };
  }, []);

  const changeHistory = (enabled: boolean) => {
    setHistoryEnabled(enabled);
    void setResultHistoryEnabled(enabled);
  };

  return (
    <View style={styles.screen}>
      <Header title="Réglages" subtitle="Personnalisez THOTIS" back icon="Gear" accent={colors.brandSecondary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing["2xl"] }]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <Text style={styles.description}>Choisissez l’apparence de THOTIS. Le choix est conservé sur cet appareil.</Text>
          <View style={styles.options}>
            {OPTIONS.map((option) => {
              const selected = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  testID={"theme-" + option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => void setPreference(option.value)}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View style={[styles.optionIcon, { backgroundColor: selected ? colors.brandSecondary + "22" : colors.surfaceSecondary }]}>
                    <Icon name={option.icon} size={22} color={selected ? colors.brandSecondary : colors.muted} weight="duotone" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    <Text style={styles.optionDetail}>{option.detail}</Text>
                  </View>
                  <Icon name={selected ? "CheckCircle" : "Circle"} size={22} color={selected ? colors.brandSecondary : colors.borderStrong} weight={selected ? "fill" : "regular"} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité et historique</Text>
          <Text style={styles.description}>Par défaut, THOTIS ne conserve pas les résultats calculés. Si vous activez cette option, un historique de 25 résultats maximum sera conservé uniquement dans le stockage local de cet appareil. La désactivation stoppe les nouveaux enregistrements sans effacer les anciens : vous pouvez les supprimer depuis la page Historique.</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.optionTitle}>Enregistrer les résultats</Text>
              <Text style={styles.optionDetail}>{historyEnabled ? "Historique local activé" : "Historique désactivé"}</Text>
            </View>
            <Switch
              testID="result-history-switch"
              value={historyEnabled}
              onValueChange={changeHistory}
              trackColor={{ false: colors.borderStrong, true: colors.brandPrimary }}
              thumbColor={colors.surfaceTertiary}
              accessibilityLabel="Enregistrer les résultats dans l’historique local"
            />
          </View>
          <Pressable testID="open-history" onPress={() => router.push("/historique" as never)} style={styles.linkRow}>
            <Icon name="ClockCounterClockwise" size={21} color={colors.brandPrimary} weight="duotone" />
            <Text style={styles.linkText}>Consulter ou effacer l’historique</Text>
            <Icon name="CaretRight" size={18} color={colors.muted} weight="bold" />
          </Pressable>
          <View style={styles.privacyNote}>
            <Icon name="ShieldCheck" size={22} color={colors.success} weight="fill" />
            <Text style={styles.privacyText}>Les calculs s’exécutent sur l’appareil. Les favoris, les outils récents et l’historique optionnel ne sont pas envoyés à un serveur par ces fonctionnalités.</Text>
          </View>
        </View>

        <Text style={styles.footer}>THOTIS · © Dr Franck LE DUFF</Text>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceTertiary },
  sectionTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.xl, color: colors.onSurface },
  description: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.onSurfaceSecondary, lineHeight: 20 },
  options: { gap: spacing.sm },
  option: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optionSelected: { borderColor: colors.brandSecondary, backgroundColor: colors.brandSecondary + "0C" },
  optionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  optionText: { flex: 1, gap: 3 },
  optionTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  optionDetail: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  switchCopy: { flex: 1, gap: 3 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  linkText: { flex: 1, fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.brandPrimary },
  privacyNote: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: colors.success + "13", padding: spacing.md, borderRadius: radius.md },
  privacyText: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.onSurfaceSecondary, lineHeight: 19 },
  footer: { textAlign: "center", fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.muted },
}));
