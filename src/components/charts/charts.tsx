import { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { ChartSpec } from "@/src/calculators/types";
import { fmt } from "@/src/stats/descriptive";
import { fonts, fontSize, radius, spacing } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

import { Icon } from "../ui/Icon";

function useWidth(): [number, (e: LayoutChangeEvent) => void] {
  const [w, setW] = useState(320);
  return [w, (e) => setW(e.nativeEvent.layout.width)];
}

function bellPath(
  xToPx: (x: number) => number,
  yToPx: (y: number) => number,
  mean: number,
  sd: number,
  xMin: number,
  xMax: number,
): string {
  const pts: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    const y = Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
    pts.push(`${i === 0 ? "M" : "L"}${xToPx(x).toFixed(1)},${yToPx(y).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Bell curve with a shaded confidence region (used in courses). */
export function BellCurveChart() {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 160;
  const padX = 16;
  const padTop = 16;
  const baseline = h - 28;
  const xMin = -4;
  const xMax = 4;
  const xToPx = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * (w - 2 * padX);
  const yToPx = (y: number) => baseline - y * (baseline - padTop);
  const lo = -1.96;
  const hi = 1.96;
  // Shaded area path
  const areaPts: string[] = [`M${xToPx(lo)},${baseline}`];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const x = lo + ((hi - lo) * i) / steps;
    const y = Math.exp(-0.5 * x * x);
    areaPts.push(`L${xToPx(x).toFixed(1)},${yToPx(y).toFixed(1)}`);
  }
  areaPts.push(`L${xToPx(hi)},${baseline} Z`);

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padX} y1={baseline} x2={w - padX} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Path d={areaPts.join(" ")} fill={colors.info + "33"} />
        <Path d={bellPath(xToPx, yToPx, 0, 1, xMin, xMax)} stroke={colors.info} strokeWidth={2.5} fill="none" />
        <Line x1={xToPx(0)} y1={yToPx(1)} x2={xToPx(0)} y2={baseline} stroke={colors.info} strokeWidth={1.5} strokeDasharray="4 4" />
        <SvgText x={xToPx(0)} y={baseline + 18} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.semibold}>
          moyenne
        </SvgText>
        <SvgText x={xToPx(lo)} y={baseline + 18} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.semibold}>
          −1,96σ
        </SvgText>
        <SvgText x={xToPx(hi)} y={baseline + 18} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.semibold}>
          +1,96σ
        </SvgText>
      </Svg>
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
        95 % des valeurs sous la courbe
      </Text>
    </View>
  );
}

/** Two overlapping bell curves (comparison illustration). */
export function CompareChart({ spec }: { spec?: ChartSpec }) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const m1 = spec && spec.type === "compare" ? spec.m1 : -1;
  const sd1 = spec && spec.type === "compare" ? Math.max(spec.sd1, 1e-6) : 1;
  const m2 = spec && spec.type === "compare" ? spec.m2 : 1.4;
  const sd2 = spec && spec.type === "compare" ? Math.max(spec.sd2, 1e-6) : 1;
  const label1 = spec && spec.type === "compare" ? spec.label1 : "Groupe A";
  const label2 = spec && spec.type === "compare" ? spec.label2 : "Groupe B";
  const h = 170;
  const padX = 16;
  const padTop = 24;
  const baseline = h - 40;
  const xMin = Math.min(m1 - 3.5 * sd1, m2 - 3.5 * sd2);
  const xMax = Math.max(m1 + 3.5 * sd1, m2 + 3.5 * sd2);
  const xToPx = (x: number) => padX + ((x - xMin) / (xMax - xMin || 1)) * (w - 2 * padX);
  const yToPx = (y: number) => baseline - y * (baseline - padTop);

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padX} y1={baseline} x2={w - padX} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Path d={bellPath(xToPx, yToPx, m1, sd1, xMin, xMax)} stroke={colors.brandPrimary} strokeWidth={2.5} fill={colors.brandPrimary + "22"} />
        <Path d={bellPath(xToPx, yToPx, m2, sd2, xMin, xMax)} stroke={colors.brandSecondary} strokeWidth={2.5} fill={colors.brandSecondary + "22"} />
        <Line x1={xToPx(m1)} y1={yToPx(1)} x2={xToPx(m1)} y2={baseline} stroke={colors.brandPrimary} strokeWidth={1.5} strokeDasharray="4 4" />
        <Line x1={xToPx(m2)} y1={yToPx(1)} x2={xToPx(m2)} y2={baseline} stroke={colors.brandSecondary} strokeWidth={1.5} strokeDasharray="4 4" />
      </Svg>
      <View style={legendStyles.row}>
        <View style={legendStyles.item}>
          <View style={[legendStyles.dot, { backgroundColor: colors.brandPrimary }]} />
          <Text style={[legendStyles.text, { color: colors.onSurface }]}>{label1}</Text>
        </View>
        <View style={legendStyles.item}>
          <View style={[legendStyles.dot, { backgroundColor: colors.brandSecondary }]} />
          <Text style={[legendStyles.text, { color: colors.onSurface }]}>{label2}</Text>
        </View>
      </View>
    </View>
  );
}

/** Horizontal confidence interval chart. */
export function CIChart({ spec }: { spec: Extract<ChartSpec, { type: "ci" }> }) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 96;
  const padX = 40;
  const y = 40;
  const span = spec.high - spec.low || 1;
  const axisMin = spec.low - span * 0.25;
  const axisMax = spec.high + span * 0.25;
  const xToPx = (x: number) => padX + ((x - axisMin) / (axisMax - axisMin)) * (w - 2 * padX);
  const includesZero = spec.low <= 0 && spec.high >= 0;

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id="ciGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.info} stopOpacity={0.5} />
            <Stop offset="1" stopColor={colors.brandPrimary} stopOpacity={0.5} />
          </LinearGradient>
        </Defs>
        {includesZero ? (
          <Line x1={xToPx(0)} y1={12} x2={xToPx(0)} y2={h - 12} stroke={colors.muted} strokeWidth={1} strokeDasharray="3 3" />
        ) : null}
        <Rect x={xToPx(spec.low)} y={y - 7} width={Math.max(1, xToPx(spec.high) - xToPx(spec.low))} height={14} rx={7} fill="url(#ciGrad)" />
        <Line x1={xToPx(spec.low)} y1={y - 12} x2={xToPx(spec.low)} y2={y + 12} stroke={colors.info} strokeWidth={2.5} />
        <Line x1={xToPx(spec.high)} y1={y - 12} x2={xToPx(spec.high)} y2={y + 12} stroke={colors.brandPrimary} strokeWidth={2.5} />
        <Circle cx={xToPx(spec.center)} cy={y} r={7} fill={colors.brandSecondary} stroke={colors.surfaceTertiary} strokeWidth={2} />
        <SvgText x={xToPx(spec.low)} y={y + 30} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.bold}>
          {fmt(spec.low, 1)}
        </SvgText>
        <SvgText x={xToPx(spec.center)} y={y - 18} fill={colors.onSurface} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          {fmt(spec.center, 1)}
        </SvgText>
        <SvgText x={xToPx(spec.high)} y={y + 30} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.bold}>
          {fmt(spec.high, 1)}
        </SvgText>
      </Svg>
      {spec.label ? (
        <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
          {spec.label}
        </Text>
      ) : null}
    </View>
  );
}

export function ResultChart({ spec }: { spec: ChartSpec }) {
  if (spec.type === "ci") return <CIChart spec={spec} />;
  if (spec.type === "groups") return <GroupsChart spec={spec} />;
  if (spec.type === "regression") return <RegressionResultChart spec={spec} />;
  if (spec.type === "survival") return <SurvivalChart spec={spec} />;
  return <CompareChart spec={spec} />;
}

/** Scatter plot and fitted least-squares line for the values actually entered. */
export function RegressionResultChart({
  spec,
}: {
  spec: Extract<ChartSpec, { type: "regression" }>;
}) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 205;
  const padL = 38;
  const padR = 14;
  const padTop = 16;
  const baseline = h - 34;
  const xValues = spec.points.map((p) => p.x);
  const yValues = spec.points.map((p) => p.y);
  const rawXMin = Math.min(...xValues);
  const rawXMax = Math.max(...xValues);
  const xPad = (rawXMax - rawXMin || Math.max(1, Math.abs(rawXMax) * 0.1)) * 0.08;
  const xMin = rawXMin - xPad;
  const xMax = rawXMax + xPad;
  const predictedEnds = [spec.intercept + spec.slope * xMin, spec.intercept + spec.slope * xMax];
  const rawYMin = Math.min(...yValues, ...predictedEnds);
  const rawYMax = Math.max(...yValues, ...predictedEnds);
  const yPad = (rawYMax - rawYMin || Math.max(1, Math.abs(rawYMax) * 0.1)) * 0.1;
  const yMin = rawYMin - yPad;
  const yMax = rawYMax + yPad;
  const xToPx = (x: number) => padL + ((x - xMin) / (xMax - xMin || 1)) * (w - padL - padR);
  const yToPx = (y: number) => baseline - ((y - yMin) / (yMax - yMin || 1)) * (baseline - padTop);

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padL} y1={baseline} x2={w - padR} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Line x1={padL} y1={padTop} x2={padL} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Line x1={xToPx(xMin)} y1={yToPx(spec.intercept + spec.slope * xMin)} x2={xToPx(xMax)} y2={yToPx(spec.intercept + spec.slope * xMax)} stroke={colors.brandSecondary} strokeWidth={2.5} />
        {spec.points.map((point, index) => (
          <Circle key={index} cx={xToPx(point.x)} cy={yToPx(point.y)} r={4.5} fill={colors.info} stroke={colors.surfaceTertiary} strokeWidth={1.5} />
        ))}
        <SvgText x={padL} y={h - 6} fill={colors.muted} fontSize={11} textAnchor="start" fontFamily={fonts.semibold}>X</SvgText>
        <SvgText x={8} y={padTop + 4} fill={colors.muted} fontSize={11} textAnchor="start" fontFamily={fonts.semibold}>Y</SvgText>
      </Svg>
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
        Nuage des observations et droite des moindres carrés
      </Text>
    </View>
  );
}

/** Kaplan–Meier step curves for the two analysed groups. */
export function SurvivalChart({
  spec,
}: {
  spec: Extract<ChartSpec, { type: "survival" }>;
}) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 220;
  const padL = 42;
  const padR = 16;
  const padTop = 18;
  const baseline = h - 42;
  const maxTime = Math.max(1, ...spec.groups.map((g) => g.maxTime));
  const xToPx = (x: number) => padL + (x / maxTime) * (w - padL - padR);
  const yToPx = (survival: number) => baseline - survival * (baseline - padTop);
  const palette = [colors.brandPrimary, colors.brandSecondary, colors.info, colors.success];

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        {[0, 0.5, 1].map((tick) => (
          <G key={tick}>
            <Line x1={padL} y1={yToPx(tick)} x2={w - padR} y2={yToPx(tick)} stroke={colors.divider} strokeWidth={1} strokeDasharray={tick === 0 ? undefined : "3 3"} />
            <SvgText x={padL - 7} y={yToPx(tick) + 4} fill={colors.muted} fontSize={10} textAnchor="end" fontFamily={fonts.semibold}>{Math.round(tick * 100)}%</SvgText>
          </G>
        ))}
        <Line x1={padL} y1={padTop} x2={padL} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Line x1={padL} y1={baseline} x2={w - padR} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        {spec.groups.map((group, groupIndex) => {
          const points = group.points.filter((point) => point.time > 0);
          let previousSurvival = 1;
          let path = `M${xToPx(0).toFixed(1)},${yToPx(1).toFixed(1)}`;
          for (const point of points) {
            path += ` L${xToPx(point.time).toFixed(1)},${yToPx(previousSurvival).toFixed(1)}`;
            path += ` L${xToPx(point.time).toFixed(1)},${yToPx(point.survival).toFixed(1)}`;
            previousSurvival = point.survival;
          }
          path += ` L${xToPx(group.maxTime).toFixed(1)},${yToPx(previousSurvival).toFixed(1)}`;
          return <Path key={group.label} d={path} stroke={palette[groupIndex % palette.length]} strokeWidth={2.8} fill="none" strokeLinejoin="round" />;
        })}
        <SvgText x={padL} y={baseline + 18} fill={colors.muted} fontSize={10} textAnchor="middle" fontFamily={fonts.semibold}>0</SvgText>
        <SvgText x={w - padR} y={baseline + 18} fill={colors.muted} fontSize={10} textAnchor="end" fontFamily={fonts.semibold}>{fmt(maxTime, 1)}</SvgText>
        <SvgText x={(padL + w - padR) / 2} y={h - 5} fill={colors.muted} fontSize={10} textAnchor="middle" fontFamily={fonts.semibold}>Temps de suivi</SvgText>
      </Svg>
      <View style={legendStyles.row}>
        {spec.groups.map((group, index) => (
          <View key={group.label} style={legendStyles.item}>
            <View style={[legendStyles.dot, { backgroundColor: palette[index % palette.length] }]} />
            <Text style={legendStyles.text}>{group.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Bar chart of group means with ± SD error bars (k ≥ 3 groups). */
export function GroupsChart({ spec }: { spec: Extract<ChartSpec, { type: "groups" }> }) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const palette = [colors.brandPrimary, colors.brandSecondary, colors.brandTertiary, colors.info, colors.success, colors.warning];
  const h = 190;
  const padX = 16;
  const padTop = 20;
  const baseline = h - 30;
  const k = spec.groups.length;
  const slot = (w - 2 * padX) / k;
  const barW = Math.min(48, slot * 0.55);
  const yMax = Math.max(...spec.groups.map((g) => g.mean + g.sd), 0);
  const yMin = Math.min(...spec.groups.map((g) => g.mean - g.sd), 0);
  const span = yMax - yMin || 1;
  const yToPx = (y: number) => baseline - ((y - yMin) / span) * (baseline - padTop);
  const zeroY = yToPx(0);

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padX} y1={zeroY} x2={w - padX} y2={zeroY} stroke={colors.border} strokeWidth={1.5} />
        {spec.groups.map((g, i) => {
          const cx = padX + slot * i + slot / 2;
          const color = palette[i % palette.length];
          const top = yToPx(Math.max(g.mean, 0));
          const bottom = yToPx(Math.min(g.mean, 0));
          return (
            <G key={g.label}>
              <Rect x={cx - barW / 2} y={top} width={barW} height={Math.max(1, bottom - top)} rx={6} fill={color + "55"} stroke={color} strokeWidth={2} />
              <Line x1={cx} y1={yToPx(g.mean - g.sd)} x2={cx} y2={yToPx(g.mean + g.sd)} stroke={colors.onSurface} strokeWidth={1.5} />
              <Line x1={cx - 6} y1={yToPx(g.mean + g.sd)} x2={cx + 6} y2={yToPx(g.mean + g.sd)} stroke={colors.onSurface} strokeWidth={1.5} />
              <Line x1={cx - 6} y1={yToPx(g.mean - g.sd)} x2={cx + 6} y2={yToPx(g.mean - g.sd)} stroke={colors.onSurface} strokeWidth={1.5} />
              <SvgText x={cx} y={yToPx(g.mean + g.sd) - 6} fill={colors.onSurface} fontSize={11} textAnchor="middle" fontFamily={fonts.extrabold}>
                {fmt(g.mean, 1)}
              </SvgText>
              <SvgText x={cx} y={baseline + 18} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.bold}>
                {g.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
        Moyenne ± écart-type par groupe
      </Text>
    </View>
  );
}

/** p-value illustration: bell curve with both tails beyond the observed statistic shaded. */
export function PValueChart() {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 170;
  const padX = 16;
  const padTop = 16;
  const baseline = h - 40;
  const xMin = -4;
  const xMax = 4;
  const xToPx = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * (w - 2 * padX);
  const yToPx = (y: number) => baseline - y * (baseline - padTop);
  const obs = 2.2;
  const tail = (from: number, to: number) => {
    const pts: string[] = [`M${xToPx(from)},${baseline}`];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const x = from + ((to - from) * i) / steps;
      pts.push(`L${xToPx(x).toFixed(1)},${yToPx(Math.exp(-0.5 * x * x)).toFixed(1)}`);
    }
    pts.push(`L${xToPx(to)},${baseline} Z`);
    return pts.join(" ");
  };
  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padX} y1={baseline} x2={w - padX} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Path d={tail(obs, xMax)} fill={colors.brandSecondary + "66"} />
        <Path d={tail(xMin, -obs)} fill={colors.brandSecondary + "66"} />
        <Path d={bellPath(xToPx, yToPx, 0, 1, xMin, xMax)} stroke={colors.info} strokeWidth={2.5} fill="none" />
        <Line x1={xToPx(obs)} y1={yToPx(0.55)} x2={xToPx(obs)} y2={baseline} stroke={colors.brandSecondary} strokeWidth={2} />
        <Line x1={xToPx(-obs)} y1={yToPx(0.55)} x2={xToPx(-obs)} y2={baseline} stroke={colors.brandSecondary} strokeWidth={2} strokeDasharray="4 3" />
        <SvgText x={xToPx(0)} y={yToPx(0.6)} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.bold}>
          distribution sous H0
        </SvgText>
        <SvgText x={xToPx(obs)} y={yToPx(0.55) - 6} fill={colors.brandSecondary} fontSize={11} textAnchor="middle" fontFamily={fonts.extrabold}>
          statistique observée
        </SvgText>
        <SvgText x={xToPx(3.1)} y={baseline - 10} fill={colors.brandSecondary} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          p/2
        </SvgText>
        <SvgText x={xToPx(-3.1)} y={baseline - 10} fill={colors.brandSecondary} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          p/2
        </SvgText>
        <SvgText x={xToPx(0)} y={baseline + 18} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.semibold}>
          aucune différence (H0)
        </SvgText>
      </Svg>
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
        La valeur p = aire colorée (bilatérale)
      </Text>
    </View>
  );
}

/** Statistical power illustration: H0 and H1 curves, α, β and 1−β regions. */
export function PowerChart() {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 190;
  const padX = 16;
  const padTop = 22;
  const baseline = h - 44;
  const xMin = -3.5;
  const xMax = 6.5;
  const m1 = 3;
  const crit = 1.96;
  const xToPx = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * (w - 2 * padX);
  const yToPx = (y: number) => baseline - y * (baseline - padTop);
  const area = (mean: number, from: number, to: number) => {
    const pts: string[] = [`M${xToPx(from)},${baseline}`];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const x = from + ((to - from) * i) / steps;
      pts.push(`L${xToPx(x).toFixed(1)},${yToPx(Math.exp(-0.5 * (x - mean) * (x - mean))).toFixed(1)}`);
    }
    pts.push(`L${xToPx(to)},${baseline} Z`);
    return pts.join(" ");
  };
  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padX} y1={baseline} x2={w - padX} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Path d={area(m1, crit, xMax)} fill={colors.brandPrimary + "55"} />
        <Path d={area(m1, xMin, crit)} fill={colors.warning + "66"} />
        <Path d={area(0, crit, xMax)} fill={colors.brandSecondary + "88"} />
        <Path d={bellPath(xToPx, yToPx, 0, 1, xMin, xMax)} stroke={colors.info} strokeWidth={2.5} fill="none" />
        <Path d={bellPath(xToPx, yToPx, m1, 1, xMin, xMax)} stroke={colors.brandPrimary} strokeWidth={2.5} fill="none" />
        <Line x1={xToPx(crit)} y1={padTop - 6} x2={xToPx(crit)} y2={baseline} stroke={colors.onSurface} strokeWidth={1.5} strokeDasharray="5 3" />
        <SvgText x={xToPx(0)} y={yToPx(1) - 6} fill={colors.info} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          H0
        </SvgText>
        <SvgText x={xToPx(m1)} y={yToPx(1) - 6} fill={colors.brandPrimary} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          H1
        </SvgText>
        <SvgText x={xToPx(2.55)} y={baseline - 6} fill={colors.brandSecondary} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          α
        </SvgText>
        <SvgText x={xToPx(1.3)} y={baseline - 6} fill={colors.warning} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          β
        </SvgText>
        <SvgText x={xToPx(4.1)} y={yToPx(0.35)} fill={colors.brandPrimary} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          1 − β
        </SvgText>
        <SvgText x={xToPx(crit)} y={baseline + 18} fill={colors.onSurface} fontSize={11} textAnchor="middle" fontFamily={fonts.bold}>
          seuil de décision
        </SvgText>
      </Svg>
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
        Puissance = 1 − β : aire de H1 au-delà du seuil
      </Text>
    </View>
  );
}

const REG_POINTS: [number, number][] = [
  [0.5, 1.6], [1, 2.4], [1.5, 1.9], [2, 3.1], [2.5, 2.7], [3, 3.9], [3.5, 3.4],
  [4, 4.6], [4.5, 4.1], [5, 5.3], [5.5, 4.8], [6, 5.9], [6.5, 6.4], [7, 6.0], [7.5, 7.1],
];

/** Regression illustration: scatter plot with fitted line and one residual. */
export function RegressionChart() {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const h = 190;
  const padL = 28;
  const padR = 16;
  const padTop = 16;
  const baseline = h - 34;
  const xMin = 0;
  const xMax = 8;
  const yMin = 0;
  const yMax = 8;
  const xToPx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (w - padL - padR);
  const yToPx = (y: number) => baseline - ((y - yMin) / (yMax - yMin)) * (baseline - padTop);
  // least squares fit
  const n = REG_POINTS.length;
  const mx = REG_POINTS.reduce((s, p) => s + p[0], 0) / n;
  const my = REG_POINTS.reduce((s, p) => s + p[1], 0) / n;
  const sxy = REG_POINTS.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
  const sxx = REG_POINTS.reduce((s, p) => s + (p[0] - mx) * (p[0] - mx), 0);
  const b = sxy / sxx;
  const a = my - b * mx;
  const resid = REG_POINTS[6];
  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      <Svg width={w} height={h}>
        <Line x1={padL} y1={baseline} x2={w - padR} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Line x1={padL} y1={padTop} x2={padL} y2={baseline} stroke={colors.border} strokeWidth={1.5} />
        <Line x1={xToPx(xMin)} y1={yToPx(a + b * xMin)} x2={xToPx(xMax)} y2={yToPx(a + b * xMax)} stroke={colors.brandSecondary} strokeWidth={2.5} />
        <Line x1={xToPx(resid[0])} y1={yToPx(resid[1])} x2={xToPx(resid[0])} y2={yToPx(a + b * resid[0])} stroke={colors.warning} strokeWidth={2} strokeDasharray="3 3" />
        {REG_POINTS.map((p, i) => (
          <Circle key={i} cx={xToPx(p[0])} cy={yToPx(p[1])} r={5} fill={colors.info} stroke={colors.surfaceTertiary} strokeWidth={1.5} />
        ))}
        <SvgText x={xToPx(resid[0]) + 8} y={yToPx(resid[1]) + 14} fill={colors.warning} fontSize={11} textAnchor="start" fontFamily={fonts.extrabold}>
          résidu
        </SvgText>
        <SvgText x={xToPx(6.2)} y={yToPx(a + b * 6.2) - 12} fill={colors.brandSecondary} fontSize={12} textAnchor="middle" fontFamily={fonts.extrabold}>
          y = a + b·x
        </SvgText>
        <SvgText x={(padL + w - padR) / 2} y={baseline + 18} fill={colors.muted} fontSize={11} textAnchor="middle" fontFamily={fonts.semibold}>
          variable explicative x
        </SvgText>
        <SvgText x={padL - 8} y={padTop + 4} fill={colors.muted} fontSize={11} textAnchor="end" fontFamily={fonts.semibold}>
          y
        </SvgText>
      </Svg>
      <Text style={{ textAlign: "center", color: colors.muted, fontFamily: fonts.semibold, fontSize: fontSize.sm }}>
        Droite des moindres carrés : elle minimise la somme des résidus²
      </Text>
    </View>
  );
}

/** Schematic diagram for case-control / cohort studies. */
export function StudyDiagram({ kind }: { kind: "casTemoins" | "cohorte" }) {
  const styles = useDiagramStyles();
  const { colors } = useTheme();
  const isCohorte = kind === "cohorte";
  const accent = isCohorte ? colors.brandPrimary : colors.brandSecondary;

  const rows = isCohorte
    ? [
        { icon: "UsersThree", label: "Exposés", tail: "→ suivi →", right: "Malades / Sains", color: accent },
        { icon: "UsersThree", label: "Non-exposés", tail: "→ suivi →", right: "Malades / Sains", color: colors.muted },
      ]
    : [
        { icon: "FirstAid", label: "Cas (malades)", tail: "← recherche ←", right: "Exposés / Non", color: accent },
        { icon: "Heart", label: "Témoins (sains)", tail: "← recherche ←", right: "Exposés / Non", color: colors.muted },
      ];

  return (
    <View style={styles.wrap}>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>{isCohorte ? "Présent" : "Passé"}</Text>
        <Icon name={isCohorte ? "ArrowRight" : "ArrowLeft"} size={18} color={colors.muted} />
        <Text style={styles.timeLabel}>{isCohorte ? "Futur" : "Présent"}</Text>
      </View>
      {rows.map((r) => (
        <View key={r.label} style={styles.row}>
          <View style={[styles.box, { borderColor: r.color, backgroundColor: r.color + "18" }]}>
            <Icon name={r.icon} size={22} color={r.color} weight="duotone" />
            <Text style={[styles.boxLabel, { color: colors.onSurface }]}>{r.label}</Text>
          </View>
          <Text style={styles.tail}>{r.tail}</Text>
          <View style={[styles.box, styles.boxOutcome]}>
            <Text style={[styles.boxLabel, { color: colors.onSurface }]}>{r.right}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const legendStyles = {
  row: { flexDirection: "row", justifyContent: "center", gap: spacing.xl, marginTop: spacing.xs } as const,
  item: { flexDirection: "row", alignItems: "center", gap: spacing.xs } as const,
  dot: { width: 12, height: 12, borderRadius: 6 } as const,
  text: { fontFamily: fonts.bold, fontSize: fontSize.sm } as const,
};

const useDiagramStyles = makeStyles((colors) => ({
  wrap: { gap: spacing.md, paddingVertical: spacing.sm },
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  timeLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.muted },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  box: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 64,
    justifyContent: "center",
  },
  boxOutcome: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  boxLabel: { fontFamily: fonts.bold, fontSize: fontSize.sm, textAlign: "center" },
  tail: { fontFamily: fonts.semibold, fontSize: 10, color: colors.muted, width: 58, textAlign: "center" },
}));
