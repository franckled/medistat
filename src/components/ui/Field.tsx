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
                style={[
                  styles.option,
                  selected
                    ? { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }
                    : { backgroundColor: colors.surfaceTertiary, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: selected ? colors.onBrandPrimary : colors.onSurfaceTertiary },
                  ]}
                >
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
        style={[
          styles.input,
          isSeries && styles.inputSeries,
          { borderColor: focused ? colors.brandPrimary : colors.border },
        ]}
      />
      {field.help ? <Text style={styles.help}>{field.help}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { gap: spacing.sm },
  labelRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  label: {
    fontFamily: fonts.bold,
    fontSize: fontSize.base,
    color: colors.onSurface,
  },
  unit: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    fontFamily: fonts.semibold,
    fontSize: fontSize.lg,
    color: colors.onSurface,
    minHeight: 52,
  },
  inputSeries: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  optionText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.base,
  },
  help: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.muted,
    lineHeight: 18,
  },
}));
