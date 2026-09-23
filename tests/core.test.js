import assert from "node:assert/strict";
import test from "node:test";

import {
  DATA_SETTING_IDS,
  DEFAULT_SETTINGS,
  PRESETS,
  applyPreset,
  normalizeProtectedOrigins,
  normalizeSettings
} from "../chrome/settings.js";
import {
  buildDataToRemove,
  buildRemovalOperations,
  getSinceFromRange
} from "../chrome/wipe.js";

test("Chrome normalizeSettings returns safe defaults", () => {
  const settings = normalizeSettings({});

  assert.equal(settings.wipeHistory, true);
  assert.equal(settings.wipeCookies, false);
  assert.equal(settings.schedule, "off");
  assert.deepEqual(settings.protectedOrigins, []);
});

test("Chrome normalizeSettings ignores invalid scalar values", () => {
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

test("Chrome protected origins are normalized and deduplicated", () => {
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

test("Chrome presets preserve non-data settings", () => {
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

test("Chrome full preset enables every supported data category", () => {
  for (const id of DATA_SETTING_IDS) {
    assert.equal(PRESETS.full[id], true);
  }
});

test("Chrome buildDataToRemove maps all supported categories", () => {
  assert.deepEqual(buildDataToRemove(PRESETS.full), {
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

test("Chrome relative ranges are deterministic", () => {
  const now = 10 * 24 * 60 * 60 * 1000;

  assert.equal(getSinceFromRange("hour", now), now - 60 * 60 * 1000);
  assert.equal(getSinceFromRange("day", now), now - 24 * 60 * 60 * 1000);
  assert.equal(getSinceFromRange("week", now), now - 7 * 24 * 60 * 60 * 1000);
});

test("Chrome protected origins apply only to origin-aware data", () => {
  const operations = buildRemovalOperations({
    ...PRESETS.full,
    timeRange: "allTime",
    protectedOrigins: ["https://example.com"]
  }, 123);

  assert.equal(operations.length, 2);

  const protectedOperation = operations.find((operation) => operation.options.excludeOrigins);
  const globalOperation = operations.find((operation) => !operation.options.excludeOrigins);

  assert.deepEqual(protectedOperation.options.excludeOrigins, ["https://example.com"]);
  assert.deepEqual(globalOperation.data, {
    history: true,
    downloads: true
  });
});
