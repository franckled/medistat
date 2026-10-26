const assert = require("node:assert/strict");

const { parseNumericSeries } = require("../.tmp-math-tests/calculators/types.js");
const { regression } = require("../.tmp-math-tests/calculators/regression.js");
const { survie } = require("../.tmp-math-tests/calculators/survie.js");

function metric(result, label) {
  return result.sections.flatMap((section) => section.metrics).find((item) => item.label === label);
}

function near(actual, expected, tolerance, label) {
  assert.ok(Number.isFinite(actual), label + " must be finite; got " + actual);
  assert.ok(Math.abs(actual - expected) <= tolerance, label + " expected " + expected + " ± " + tolerance + ", got " + actual);
}

// The French decimal separator must not split one observation into two.
assert.deepEqual(parseNumericSeries("12,4 13,1 11,8"), [12.4, 13.1, 11.8]);
assert.deepEqual(parseNumericSeries("12,4;13,1;11,8"), [12.4, 13.1, 11.8]);
assert.deepEqual(parseNumericSeries("1,2,3"), [1, 2, 3]);
assert.equal(parseNumericSeries("1 2 valeur 4"), null);

const regressionCalculator = regression.find((item) => item.id === "regression-correlation");
assert.ok(regressionCalculator, "regression calculator is registered");
const regressionResult = regressionCalculator.compute({
  x: "1 2 3 4 5",
  y: "2 4 6 8 10",
});
assert.equal(regressionResult.error, undefined);
assert.equal(regressionResult.chart.type, "regression");
near(Number(metric(regressionResult, "Pente estimée β₁").value.replace(",", ".")), 2, 1e-10, "perfect-line slope");
near(Number(metric(regressionResult, "Ordonnée à l’origine β₀").value.replace(",", ".")), 0, 1e-10, "perfect-line intercept");
near(Number(metric(regressionResult, "Pearson r").value.replace(",", ".")), 1, 1e-10, "Pearson r");
near(Number(metric(regressionResult, "Spearman ρ").value.replace(",", ".")), 1, 1e-10, "Spearman rho");
near(Number(metric(regressionResult, "Coefficient de détermination R²").value.replace(",", ".")), 1, 1e-10, "R squared");

const badRegression = regressionCalculator.compute({ x: "1 2 3", y: "1 2" });
assert.match(badRegression.error, /même nombre/);

const survivalCalculator = survie.find((item) => item.id === "survie-kaplan-meier-logrank");
assert.ok(survivalCalculator, "survival calculator is registered");
const survivalResult = survivalCalculator.compute({
  timesA: "1 2 3", eventsA: "1 1 1",
  timesB: "1 2 3", eventsB: "0 1 0",
});
assert.equal(survivalResult.error, undefined);
assert.equal(survivalResult.chart.type, "survival");
assert.equal(metric(survivalResult, "Médiane de survie").value, "2,00");
near(Number(metric(survivalResult, "Test du log-rank, χ² (1 ddl)").value.replace(",", ".")), 1.2, 0.002, "log-rank chi-square");
const pValue = Number(metric(survivalResult, "p bilatérale").value.replace("p = ", "").replace(",", "."));
near(pValue, 0.273, 0.002, "log-rank p-value");

const invalidStatus = survivalCalculator.compute({
  timesA: "1 2 3", eventsA: "1 2 1",
  timesB: "1 2 3", eventsB: "0 1 0",
});
assert.match(invalidStatus.error, /indicateurs d’événement/);

process.stdout.write("THOTIS statistical regression tests passed: decimal parsing, regression/correlations, Kaplan–Meier and log-rank.\n");
