import { test } from "node:test";
import assert from "node:assert/strict";
import { getSummaryList, getLatestSummary, getDescriptorById } from "./summaryList";

test("weekly list has one entry per consecutive snapshot pair, newest first", () => {
  const weekly = getSummaryList("weekly");
  // 8 seed snapshots -> 7 consecutive pairs
  assert.equal(weekly.length, 7);
  assert.equal(weekly[0].toSnapshotId, "snap-08");
  assert.equal(weekly[0].fromSnapshotId, "snap-07");
  for (const w of weekly) {
    assert.equal(w.cadence, "weekly");
    assert.ok(w.hook.length > 0);
    assert.equal(typeof w.headlinePct, "number");
  }
});

test("monthly list uses 2-step windows and includes the latest snapshot", () => {
  const monthly = getSummaryList("monthly");
  assert.ok(monthly.length >= 1);
  assert.equal(monthly[0].toSnapshotId, "snap-08");
  assert.equal(monthly[0].fromSnapshotId, "snap-06");
  for (const m of monthly) assert.equal(m.cadence, "monthly");
});

test("yearly list has one entry per lookback year (1-5), always populated", () => {
  const yearly = getSummaryList("yearly");
  assert.equal(yearly.length, 5);
  for (const y of yearly) {
    assert.equal(y.cadence, "yearly");
    assert.equal(typeof y.headlinePct, "number");
    assert.ok(y.hook.length > 0);
    assert.ok(y.id.startsWith("yearly-"));
  }
});

test("getLatestSummary returns the newest weekly descriptor", () => {
  const latest = getLatestSummary();
  assert.equal(latest?.toSnapshotId, "snap-08");
  assert.equal(latest?.cadence, "weekly");
});

test("ids are unique within a cadence", () => {
  for (const cadence of ["weekly", "monthly", "yearly"] as const) {
    const ids = getSummaryList(cadence).map((d) => d.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate ids in ${cadence}`);
  }
});

test("getDescriptorById resolves the correct cadence from id prefix", () => {
  const weekly = getSummaryList("weekly")[0];
  const monthly = getSummaryList("monthly")[0];
  const yearly = getSummaryList("yearly")[0];
  assert.deepEqual(getDescriptorById(weekly.id), weekly);
  assert.deepEqual(getDescriptorById(monthly.id), monthly);
  assert.deepEqual(getDescriptorById(yearly.id), yearly);
});
