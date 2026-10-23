import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Platform, Pressable, Share, Text, View } from "react-native";

import { CalcResult } from "@/src/calculators/types";
import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

import { ResultChart } from "./charts/charts";
import { Icon } from "./ui/Icon";

const COPYRIGHT = "© Dr Franck LE DUFF";

function toPlainText(r: CalcResult): string {
  const lines: string[] = [r.title, ""];
  r.sections.forEach((s) => {
    if (s.heading) lines.push(s.heading);
    s.metrics.forEach((m) => lines.push(`  • ${m.label} : ${m.value}`));
    lines.push("");
  });
  lines.push("Rédaction pour une thèse :");
  lines.push(r.thesis);
  lines.push("");
  lines.push(`— Thotis · ${COPYRIGHT}`);
  return lines.join("\n");
}

function toHtml(r: CalcResult): string {
  const sections = r.sections
    .map(
      (s) => `
      ${s.heading ? `<h3>${s.heading}</h3>` : ""}
      <table>${s.metrics
        .map(
          (m) =>
            `<tr><td class="lbl">${m.label}</td><td class="val">${m.value}</td></tr>`,
        )
        .join("")}</table>`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; color:#10233F; padding:32px; }
    h1 { font-size:22px; color:#079DD7; margin-bottom:4px; }
    h3 { font-size:14px; color:#647B92; text-transform:uppercase; letter-spacing:.5px; margin:20px 0 6px; }
    table { width:100%; border-collapse:collapse; }
    td { padding:6px 0; border-bottom:1px solid #D9E7F2; font-size:14px; }
    td.val { text-align:right; font-weight:700; }
    .thesis { margin-top:24px; padding:16px; background:#E8F6FB; border-radius:12px; font-size:14px; line-height:1.6; }
    .thesis h3 { margin-top:0; }
    footer { margin-top:32px; font-size:12px; color:#647B92; text-align:center; }
  </style></head><body>
    <h1>${r.title}</h1>
    ${sections}
    <div class="thesis"><h3>Rédaction pour une thèse</h3>${r.thesis}</div>
    <footer>Thotis &nbsp;·&nbsp; ${COPYRIGHT}</footer>
  </body></html>`;
}

export function ResultCard({ result }: { result: CalcResult }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [flash, setFlash] = useState<string | null>(null);

  const toneColor = (tone?: string) => {
    if (tone === "success") return colors.success;
    if (tone === "warning") return colors.warning;
    if (tone === "error") return colors.error;
    return colors.onSurface;
  };

  const notify = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 1800);
  };

  const onCopy = async () => {
    await Clipboard.setStringAsync(toPlainText(result));
    notify("Copié dans le presse-papier ✓");
  };

  const onShare = async () => {
    try {
      await Share.share({ message: toPlainText(result) });
    } catch {
      notify("Partage indisponible");
    }
  };

  const onPdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: toHtml(result) });
      if (Platform.OS === "web") {
        notify("PDF généré ✓");
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
      } else {
        notify("PDF : " + uri);
      }
    } catch {
      notify("Export PDF indisponible");
    }
  };

  return (
    <View style={styles.card} testID="result-card">
      <View style={styles.titleRow}>
        <View style={styles.badge}>
          <Icon name="Sparkle" size={18} color={colors.onBrandPrimary} weight="fill" />
        </View>
        <Text style={styles.title}>Résultat</Text>
      </View>

      {result.sections.map((section, si) => (
        <View key={si} style={styles.section}>
          {section.heading ? <Text style={styles.heading}>{section.heading}</Text> : null}
          {section.metrics.map((m, mi) => (
            <View
              key={mi}
              style={[styles.metricRow, m.highlight && styles.metricHighlight]}
            >
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  m.highlight && styles.metricValueHi,
                  { color: toneColor(m.tone) },
                ]}
              >
                {m.value}
              </Text>
            </View>
          ))}
        </View>
      ))}

      {result.chart ? (
        <View style={styles.chartBox}>
          <ResultChart spec={result.chart} />
        </View>
      ) : null}

      <View style={styles.interpretBox}>
        <Icon name="Lightbulb" size={18} color={colors.brandTertiary} weight="fill" />
        <Text style={styles.interpretText}>{result.interpretation}</Text>
      </View>

      <View style={styles.thesisBox}>
        <Text style={styles.thesisLabel}>Rédaction pour une thèse</Text>
        <Text selectable style={styles.thesisText}>
          {result.thesis}
        </Text>
      </View>

      <View style={styles.actions}>
        <ActionButton icon="Copy" label="Copier" onPress={onCopy} color={colors.brandPrimary} testID="copy-button" />
        <ActionButton icon="ShareNetwork" label="Partager" onPress={onShare} color={colors.info} testID="share-button" />
        <ActionButton icon="FilePdf" label="PDF" onPress={onPdf} color={colors.brandSecondary} testID="pdf-button" />
      </View>

      <Text style={styles.copyright}>Thotis · {COPYRIGHT}</Text>

      {flash ? (
        <View style={styles.flash} testID="result-flash">
          <Text style={styles.flashText}>{flash}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  color,
  testID,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
  testID: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.actionInner,
        { backgroundColor: color + "18" },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon name={icon} size={20} color={color} weight="bold" />
      <Text style={[styles.actionLabel, { color: colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  badge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: fonts.extrabold, fontSize: fontSize.xl, color: colors.onSurface },
  section: { gap: spacing.xs },
  heading: {
    fontFamily: fonts.extrabold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.muted,
    marginTop: spacing.sm,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.md,
  },
  metricHighlight: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0,
  },
  metricLabel: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.onSurfaceSecondary },
  metricValue: { fontFamily: fonts.bold, fontSize: fontSize.base },
  metricValueHi: { fontFamily: fonts.extrabold, fontSize: fontSize.lg },
  chartBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interpretBox: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary + "1A",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  interpretText: { flex: 1, fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 20 },
  thesisBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  thesisLabel: {
    fontFamily: fonts.extrabold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.brand,
  },
  thesisText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 22 },
  actions: { flexDirection: "row", gap: spacing.sm },
  actionInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  actionLabel: { fontFamily: fonts.bold, fontSize: fontSize.base },
  copyright: { textAlign: "center", fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.muted },
  flash: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.lg,
    backgroundColor: colors.surfaceInverse,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  flashText: { color: colors.onSurfaceInverse, fontFamily: fonts.bold, fontSize: fontSize.base },
}));
