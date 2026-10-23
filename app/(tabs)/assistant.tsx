import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/src/components/ui/Button";
import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import {
  Answer,
  NODES,
  RECOMMENDATIONS,
  Recommendation,
  START_NODE,
} from "@/src/content/assistant";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";


export default function AssistantScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const [current, setCurrent] = useState(START_NODE);
  const [history, setHistory] = useState<string[]>([]);
  const [reco, setReco] = useState<Recommendation | null>(null);

  const node = NODES[current];

  const answer = (a: Answer) => {
    if (a.next.startsWith("rec:")) {
      setReco(RECOMMENDATIONS[a.next.slice(4)]);
    } else {
      setHistory((h) => [...h, current]);
      setCurrent(a.next);
    }
  };

  const goBack = () => {
    if (reco) {
      setReco(null);
      return;
    }
    setHistory((h) => {
      if (h.length === 0) return h;
      const copy = [...h];
      setCurrent(copy.pop()!);
      return copy;
    });
  };

  const restart = () => {
    setCurrent(START_NODE);
    setHistory([]);
    setReco(null);
  };

  const step = history.length + 1;

  return (
    <View style={styles.screen}>
      <Header title="Assistant méthode" subtitle="Trouvez le test adapté à vos données" icon="MagicWand" accent={colors.brandSecondary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xl }]}
      >
        {reco ? (
          <View style={styles.recoWrap} testID="assistant-reco">
            <LinearGradient
              colors={[colors.brand, "#075A87", colors.brandPrimary, colors.info]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recoHero}
            >
              <View style={styles.recoGlow} />
              <Icon name="ChartLineUp" size={64} color="#B4FFF0" weight="duotone" />
              <View style={styles.recoBadge}>
                <Icon name="Confetti" size={27} color="#FFFFFF" weight="fill" />
              </View>
            </LinearGradient>
            <Text style={styles.recoLabel}>Test recommandé</Text>
            <Text style={styles.recoTitle}>{reco.test}</Text>
            <Text style={styles.recoWhy}>{reco.why}</Text>
            {reco.calcId ? (
              <Button
                label="Ouvrir le calculateur"
                icon="ArrowRight"
                variant="secondary"
                testID="reco-open-calc"
                onPress={() => router.push(`/calculator/${reco.calcId}` as never)}
              />
            ) : null}
            <View style={styles.recoActions}>
              <Button label="Précédent" icon="ArrowLeft" variant="outline" onPress={goBack} testID="reco-back" style={{ flex: 1 }} />
              <Button label="Recommencer" icon="ArrowCounterClockwise" variant="outline" onPress={restart} testID="reco-restart" style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.stepRow}>
              <Text style={styles.stepText}>Étape {step}</Text>
              {history.length > 0 ? (
                <Pressable onPress={goBack} testID="assistant-back" hitSlop={8} style={styles.backLink}>
                  <Icon name="ArrowLeft" size={16} color={colors.brandSecondary} weight="bold" />
                  <Text style={styles.backLinkText}>Précédent</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.question}>{node.question}</Text>
            {node.help ? <Text style={styles.help}>{node.help}</Text> : null}

            <View style={styles.answers}>
              {node.answers.map((a, i) => (
                <Pressable
                  key={i}
                  testID={`answer-${current}-${i}`}
                  onPress={() => answer(a)}
                  style={({ pressed }) => [styles.answerCard, pressed && styles.answerPressed]}
                >
                  <View style={styles.answerText}>
                    <Text style={styles.answerLabel}>{a.label}</Text>
                    {a.hint ? <Text style={styles.answerHint}>{a.hint}</Text> : null}
                  </View>
                  <Icon name="CaretRight" size={20} color={colors.brandSecondary} weight="bold" />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepText: {
    fontFamily: fonts.extrabold,
    fontSize: fontSize.sm,
    color: colors.brandSecondary,
    backgroundColor: colors.brandSecondary + "18",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  backLink: { flexDirection: "row", alignItems: "center", gap: 4 },
  backLinkText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.brandSecondary },
  question: { fontFamily: fonts.extrabold, fontSize: fontSize["2xl"], color: colors.onSurface, lineHeight: 30, marginTop: spacing.sm },
  help: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.muted, lineHeight: 20 },
  answers: { gap: spacing.md, marginTop: spacing.sm },
  answerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  answerPressed: { opacity: 0.9, transform: [{ scale: 0.99 }], borderColor: colors.brandSecondary },
  answerText: { flex: 1, gap: 3 },
  answerLabel: { fontFamily: fonts.extrabold, fontSize: fontSize.lg, color: colors.onSurface },
  answerHint: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted },
  recoWrap: { gap: spacing.md },
  recoHero: { height: 168, borderRadius: radius.lg, overflow: "hidden", justifyContent: "center", alignItems: "center", gap: spacing.xs },
  recoGlow: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#FFFFFF", opacity: 0.08, right: -35, top: -65 },
  recoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  recoLabel: {
    fontFamily: fonts.extrabold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.brandSecondary,
    marginTop: spacing.sm,
  },
  recoTitle: { fontFamily: fonts.extrabold, fontSize: fontSize["2xl"], color: colors.onSurface },
  recoWhy: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 22, marginBottom: spacing.sm },
  recoActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
}));
