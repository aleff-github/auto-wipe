import assert from "node:assert/strict";
import test from "node:test";

import {
  DATA_SETTING_IDS,
  DEFAULT_SETTINGS,
  PRESETS,
  applyPreset,
  normalizeProtectedOrigins,
  normalizeSettings
} from "../settings.js";
import {
  buildDataToRemove,
  buildRemovalOperations,
  getSinceFromRange
} from "../wipe.js";

test("normalizeSettings returns safe defaults", () => {
  const settings = normalizeSettings({});

  assert.equal(settings.wipeHistory, true);
  assert.equal(settings.wipeCookies, false);
  assert.equal(settings.schedule, "off");
  assert.deepEqual(settings.protectedOrigins, []);
});

test("normalizeSettings ignores invalid scalar values", () => {
  const settings = normalizeSettings({
    wipeHistory: "yes",
    wipeCache: false,
    timeRange: "forever",
    schedule: "constantly"
  });

  assert.equal(settings.wipeHistory, true);
  assert.equal(settings.wipeCache, false);
  assert.equal(settings.timeRange, "allTime");
  assert.equal(settings.schedule, "off");
});

test("protected origins are normalized, deduplicated and restricted to HTTP(S)", () => {
  assert.deepEqual(
    normalizeProtectedOrigins([
      "example.com/path",
      "https://example.com/another",
      "http://localhost:8080/test",
      "javascript:alert(1)",
      "not a url"
    ]),
    [
      "https://example.com",
      "http://localhost:8080"
    ]
  );
});

test("presets only replace data-category selections", () => {
  const settings = applyPreset("light", {
    ...DEFAULT_SETTINGS,
    schedule: "daily",
    timeRange: "day",
    protectedOrigins: ["https://example.com"]
  });

  assert.equal(settings.schedule, "daily");
  assert.equal(settings.timeRange, "day");
  assert.deepEqual(settings.protectedOrigins, ["https://example.com"]);
  assert.equal(settings.wipeCache, true);
  assert.equal(settings.wipeHistory, false);
});

test("full preset enables every supported data category", () => {
  for (const id of DATA_SETTING_IDS) {
    assert.equal(PRESETS.full[id], true);
  }
});

test("unknown presets are rejected", () => {
  assert.throws(() => applyPreset("unknown"), /Unknown preset/);
});

test("buildDataToRemove maps all supported categories", () => {
  const data = buildDataToRemove(PRESETS.full);

  assert.deepEqual(data, {
    history: true,
    cache: true,
    cacheStorage: true,
    downloads: true,
    cookies: true,
    localStorage: true,
    indexedDB: true,
    serviceWorkers: true
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

test("removal uses one operation when no protected origins exist", () => {
  const operations = buildRemovalOperations({
    ...DEFAULT_SETTINGS,
    timeRange: "hour",
    protectedOrigins: []
  }, 10_000_000);

  assert.equal(operations.length, 1);
  assert.equal(operations[0].options.excludeOrigins, undefined);
  assert.equal(operations[0].options.since, 10_000_000 - 60 * 60 * 1000);
});

test("protected origins apply only to origin-aware data", () => {
  const operations = buildRemovalOperations({
    ...PRESETS.full,
    timeRange: "allTime",
    protectedOrigins: ["https://example.com"]
  }, 123);

  assert.equal(operations.length, 2);

  const protectedOperation = operations.find((operation) => operation.options.excludeOrigins);
  const globalOperation = operations.find((operation) => !operation.options.excludeOrigins);

  assert.deepEqual(protectedOperation.options.excludeOrigins, ["https://example.com"]);
  assert.deepEqual(protectedOperation.data, {
    cache: true,
    cacheStorage: true,
    cookies: true,
    localStorage: true,
    indexedDB: true,
    serviceWorkers: true
  });
  assert.deepEqual(globalOperation.data, {
    history: true,
    downloads: true
  });
});
