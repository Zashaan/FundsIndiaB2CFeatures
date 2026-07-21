import { test } from "node:test";
import assert from "node:assert/strict";
import { computeHistoricalGrowth, subtractYears } from "./historicalGrowth";
import { getSnapshots } from "@/lib/data/repository";

test("subtractYears moves the date back by exactly N years", () => {
  assert.equal(subtractYears("2026-07-05", 1), "2025-07-05");
  assert.equal(subtractYears("2026-07-05", 5), "2021-07-05");
});

test("computeHistoricalGrowth returns one point per requested year, always populated", () => {
  const snapshots = getSnapshots();
  const latest = snapshots[snapshots.length - 1];
  const points = computeHistoricalGrowth(latest.holdings, latest.date, latest.totalValue, [1, 3, 5]);
  assert.equal(points.length, 3);
  assert.deepEqual(
    points.map((p) => p.yearsAgo),
    [1, 3, 5]
  );
  for (const p of points) {
    assert.equal(typeof p.valueThen, "number");
    assert.ok(p.valueThen > 0, `valueThen should be a real positive number for ${p.yearsAgo}y ago`);
    assert.equal(p.valueNow, Math.round(latest.totalValue * 100) / 100);
    // pctChange must be internally consistent with valueThen/valueNow
    const expectedPct = Math.round((((p.valueNow - p.valueThen) / p.valueThen) * 100) * 100) / 100;
    assert.equal(p.pctChange, expectedPct);
  }
});

test("further lookbacks compound (5-year value differs from 1-year value)", () => {
  const snapshots = getSnapshots();
  const latest = snapshots[snapshots.length - 1];
  const points = computeHistoricalGrowth(latest.holdings, latest.date, latest.totalValue, [1, 5]);
  assert.notEqual(points[0].valueThen, points[1].valueThen);
});
