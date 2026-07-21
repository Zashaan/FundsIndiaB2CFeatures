import { test } from "node:test";
import assert from "node:assert/strict";
import { findLargerPriorDip } from "./priorDipContext";
import { getSnapshots } from "@/lib/data/repository";
import { compareSnapshots } from "./compareSnapshots";

test("returns null when there is no larger prior dip", () => {
  const snapshots = getSnapshots();
  // Index 1 has no "prior" window at all (only snapshots[0] exists before it).
  const result = findLargerPriorDip(snapshots, 1, 100);
  assert.equal(result, null);
});

test("returns null when the real worst larger prior dip has not recovered", () => {
  const snapshots = getSnapshots();
  // The real 90-day seed data contains prior dips, but the worst qualifying
  // one before the final snapshot has not recovered to its pre-dip total
  // value within the dataset. The engine should avoid fabricating a positive
  // context line in that case.
  const lastIndex = snapshots.length - 1;
  const result = findLargerPriorDip(snapshots, lastIndex, 0.01);
  assert.equal(result, null);
});

test("finds a real larger prior dip once the dataset contains a later recovery", () => {
  const snapshots = getSnapshots().map((s) => ({ ...s }));
  const lastIndex = snapshots.length - 1;
  // Make the final seeded snapshot recover above snap-05's pre-dip value,
  // while keeping all NAV/holding data real for the compareSnapshots
  // magnitude calculation.
  snapshots[lastIndex] = { ...snapshots[lastIndex], totalValue: snapshots[4].totalValue + 1 };
  const result = findLargerPriorDip(snapshots, lastIndex, 0.01);
  assert.ok(result);
  assert.equal(typeof result.date, "string");
  assert.ok(result.magnitudePct > 0.01);
  assert.ok(result.recoveredAfterPeriods >= 0);

  const dipIndex = snapshots.findIndex((s) => s.date === result!.date);
  assert.ok(dipIndex > 0);
  const dipDiff = compareSnapshots(snapshots[dipIndex - 1], snapshots[dipIndex]);
  const expectedMagnitude = Math.round(-dipDiff.marketDrivenPercentChange * 100) / 100;
  assert.equal(result!.magnitudePct, expectedMagnitude);
});
