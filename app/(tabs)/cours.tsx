import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BellCurveChart,
  CompareChart,
  PowerChart,
  PValueChart,
  RegressionChart,
  StudyDiagram,
} from "@/src/components/charts/charts";
import { Accordion } from "@/src/components/ui/Accordion";
import { Header } from "@/src/components/ui/Header";
import { Icon } from "@/src/components/ui/Icon";
import { COURSES, Course, CourseChart } from "@/src/content/cours";
import { usesNativeTabs } from "@/src/navigation";
import { makeStyles, useTheme } from "@/src/theme";
import { fonts, fontSize, radius, spacing } from "@/src/typography";

function ChartFor({ chart }: { chart: CourseChart }) {
  if (chart === "compare") return <CompareChart />;
  if (chart === "casTemoins") return <StudyDiagram kind="casTemoins" />;
  if (chart === "cohorte") return <StudyDiagram kind="cohorte" />;
  if (chart === "pvalue") return <PValueChart />;
  if (chart === "power") return <PowerChart />;
  if (chart === "regression") return <RegressionChart />;
  return <BellCurveChart />;
}

function CourseBody({ course }: { course: Course }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <>
      {course.chart ? (
        <View style={styles.chartBox}>
          <ChartFor chart={course.chart} />
        </View>
      ) : null}
      {course.sections.map((s, i) => (
        <View key={i} style={styles.section}>
          {s.heading ? (
            <Text style={[styles.heading, { color: colors[course.accent] }]}>{s.heading}</Text>
          ) : null}
          {s.paragraphs.map((p, j) => (
            <Text key={j} style={styles.paragraph}>
              {p}
            </Text>
          ))}
        </View>
      ))}
    </>
  );
}

export default function CoursScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  return (
    <View style={styles.screen}>
      <Header title="Cours & rappels" subtitle="Les méthodes statistiques expliquées" icon="BookOpen" accent={colors.info} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xl }]}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Icon name="Lightbulb" size={23} color={colors.brandTertiary} weight="fill" />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>Apprendre en un coup d’œil</Text>
            <Text style={styles.intro}>
              Ouvrez une fiche pour voir le rappel, le schéma et les points clés.
            </Text>
          </View>
        </View>
        {COURSES.map((course) => (
          <Accordion
            key={course.id}
            testID={`course-${course.id}`}
            title={course.title}
            subtitle={course.subtitle}
            icon={course.icon}
            accent={colors[course.accent]}
            defaultOpen={course.id === "intervalles-confiance"}
          >
            <CourseBody course={course} />
          </Accordion>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  introCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, marginBottom: spacing.xs },
  introIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  introCopy: { flex: 1, gap: 3 },
  introTitle: { fontFamily: fonts.extrabold, fontSize: fontSize.base, color: colors.onSurface },
  intro: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.muted, lineHeight: 18 },
  chartBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  section: { gap: spacing.xs, marginTop: spacing.xs },
  heading: { fontFamily: fonts.extrabold, fontSize: fontSize.base },
  paragraph: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.onSurface, lineHeight: 22 },
}));
