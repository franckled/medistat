import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CalcResult, getCalculator } from "@/src/calculators";
import { ResultCard } from "@/src/components/ResultCard";
import { Button } from "@/src/components/ui/Button";
import { Field } from "@/src/components/ui/Field";
import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { makeStyles, useTheme } from "@/src/theme";
import { recordCalculatorUse, saveCalculationResult } from "@/src/utils/activity";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

export default function CalculatorScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const calc = getCalculator(String(id));

  const initial = useMemo(() => {
    const v: Record<string, string> = {};
    calc?.inputs.forEach((f) => (v[f.key] = f.default ?? ""));
    return v;
  }, [calc]);

  const [values, setValues] = useState<Record<string, string>>(initial);
  const [result, setResult] = useState<CalcResult | null>(null);

  useEffect(() => {
    if (calc) void recordCalculatorUse(calc.id);
  }, [calc?.id]);

  if (!calc) {
    return (
      <View style={styles.screen}>
        <Header title="Calculateur" back />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Calculateur introuvable.</Text>
        </View>
      </View>
    );
  }

  const accent = colors[calc.accent];

  const onCompute = () => {
    const computed = calc.compute(values);
    setResult(computed);
    if (!computed.error) void saveCalculationResult(calc.id, calc.title, computed);
  };

  const onReset = () => {
    setValues(initial);
    setResult(null);
  };

  return (
    <View style={styles.screen}>
      <Header title={calc.title} subtitle={calc.subtitle} back accent={accent} />
      <KeyboardAwareScrollView
        bottomOffset={24}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing["2xl"] }]}
      >
        <View style={[styles.descBox, { backgroundColor: accent + "12", borderColor: accent + "33" }]}>
          <Icon name="Info" size={18} color={accent} weight="fill" />
          <Text style={styles.descText}>{calc.description}</Text>
        </View>
        {calc.source ? (
          <View style={styles.sourceBox}>
            <Text style={styles.sourceLabel}>Référence de la formule</Text>
            <Text style={styles.sourceText}>{calc.source}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {calc.inputs.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={values[f.key] ?? ""}
              onChange={(val) => setValues((prev) => ({ ...prev, [f.key]: val }))}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            label="Calculer"
            icon="Sparkle"
            onPress={onCompute}
            testID="compute-button"
            variant={calc.accent === "brandSecondary" ? "secondary" : calc.accent === "brandTertiary" ? "tertiary" : "primary"}
          />
          <Button label="Réinitialiser" icon="ArrowCounterClockwise" onPress={onReset} variant="outline" testID="reset-button" />
        </View>

        {result?.error ? (
          <View style={styles.errorBox} testID="calc-error">
            <Icon name="WarningCircle" size={20} color={colors.error} weight="fill" />
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        ) : null}

        {result && !result.error ? <ResultCard result={result} /> : null}
      </KeyboardAwareScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.lg },
  descBox: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  descText: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.onSurface, lineHeight: 19 },
  sourceBox: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, gap: spacing.xs },
  sourceLabel: { fontFamily: fonts.extrabold, fontSize: fontSize.xs, color: colors.brandPrimary, textTransform: "uppercase", letterSpacing: 0.4 },
  sourceText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.onSurfaceSecondary, lineHeight: 17 },
  form: { gap: spacing.lg },
  buttons: { gap: spacing.sm },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.error + "14",
  },
  errorText: { flex: 1, fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.error },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.muted },
}));
