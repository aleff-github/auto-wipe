import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_SETTINGS, normalizeSettings } from "../settings.js";
import { buildDataToRemove, getSinceFromRange } from "../wipe.js";

test("normalizeSettings returns defaults for an empty object", () => {
  assert.deepEqual(normalizeSettings({}), DEFAULT_SETTINGS);
});

test("normalizeSettings ignores invalid values", () => {
  const settings = normalizeSettings({
    wipeHistory: "yes",
    wipeCache: false,
    timeRange: "forever"
  });

  assert.equal(settings.wipeHistory, true);
  assert.equal(settings.wipeCache, false);
  assert.equal(settings.timeRange, "allTime");
});

test("buildDataToRemove maps only selected categories", () => {
  const data = buildDataToRemove({
    wipeHistory: true,
    wipeCache: false,
    wipeCacheStorage: true,
    wipeDownloads: false
  });

  assert.deepEqual(data, {
    history: true,
    cacheStorage: true
  });
});

test("all-time range starts at the Unix epoch", () => {
  assert.equal(getSinceFromRange("allTime", 123456), 0);
});

test("relative ranges are calculated from the supplied time", () => {
  const now = 10 * 24 * 60 * 60 * 1000;

  assert.equal(getSinceFromRange("hour", now), now - 60 * 60 * 1000);
  assert.equal(getSinceFromRange("day", now), now - 24 * 60 * 60 * 1000);
  assert.equal(getSinceFromRange("week", now), now - 7 * 24 * 60 * 60 * 1000);
});

test("unknown ranges are rejected", () => {
  assert.throws(() => getSinceFromRange("unknown", Date.now()), /Unsupported time range/);
});
