import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { InputField } from "@/src/calculators/types";
import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

type Props = {
  field: InputField;
  value: string;
  onChange: (v: string) => void;
};

export function Field({ field, value, onChange }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  if (field.type === "select") {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{field.label}</Text>
        <View style={styles.optionsWrap}>
          {field.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <Pressable
                key={opt.value}
                testID={`option-${field.key}-${opt.value}`}
                onPress={() => onChange(opt.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.option,
                  selected
                    ? { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }
                    : { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.optionText, { color: selected ? "#FFFFFF" : colors.onSurfaceTertiary }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {field.help ? <Text style={styles.help}>{field.help}</Text> : null}
      </View>
    );
  }

  const isSeries = field.type === "series";
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{field.label}</Text>
        {field.unit ? <Text style={styles.unit}>{field.unit}</Text> : null}
      </View>
      <TextInput
        testID={`input-${field.key}`}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={field.placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={isSeries ? "default" : "decimal-pad"}
        multiline={isSeries}
        selectionColor={colors.brandPrimary}
        style={[
          styles.input,
          isSeries && styles.inputSeries,
          {
            borderColor: focused ? colors.brandPrimary : colors.border,
            backgroundColor: colors.surfaceTertiary,
          },
          focused && styles.inputFocused,
        ]}
      />
      {field.help ? <Text style={styles.help}>{field.help}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { gap: spacing.sm },
  labelRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm },
  label: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  unit: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.brandPrimary },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 3,
    fontFamily: fonts.semibold,
    fontSize: fontSize.lg,
    color: colors.onSurface,
    minHeight: 54,
  },
  inputFocused: { shadowColor: colors.brandPrimary, shadowOpacity: 0.09, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  inputSeries: { minHeight: 92, textAlignVertical: "top", paddingTop: spacing.md },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5 },
  optionPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  optionText: { fontFamily: fonts.extrabold, fontSize: fontSize.sm },
  help: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.muted, lineHeight: 19 },
}));
