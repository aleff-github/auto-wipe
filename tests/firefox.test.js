import assert from "node:assert/strict";
import test from "node:test";

import {
  DATA_SETTING_IDS,
  DEFAULT_SETTINGS,
  PRESETS,
  applyPreset,
  normalizeSettings
} from "../firefox/settings.js";
import {
  buildDataToRemove,
  buildRemovalOperations,
  getSinceFromRange
} from "../firefox/wipe.js";

test("Firefox defaults do not include Chromium-only categories", () => {
  const settings = normalizeSettings({});

  assert.equal("wipeCacheStorage" in settings, false);
  assert.equal("protectedOrigins" in settings, false);
  assert.equal(settings.schedule, "off");
});

test("Firefox full preset enables all supported Firefox categories", () => {
  for (const id of DATA_SETTING_IDS) {
    assert.equal(PRESETS.full[id], true);
  }

  assert.equal("wipeCacheStorage" in PRESETS.full, false);
});

test("Firefox presets preserve schedule and time range", () => {
  const settings = applyPreset("light", {
    ...DEFAULT_SETTINGS,
    schedule: "weekly",
    timeRange: "week"
  });

  assert.equal(settings.schedule, "weekly");
  assert.equal(settings.timeRange, "week");
  assert.equal(settings.wipeCache, true);
  assert.equal(settings.wipeHistory, false);
});

test("Firefox data map omits cacheStorage", () => {
  assert.deepEqual(buildDataToRemove(PRESETS.full), {
    history: true,
    cache: true,
    downloads: true,
    cookies: true,
    localStorage: true,
    indexedDB: true,
    serviceWorkers: true
  });
});

test("Firefox removal planner never emits excludeOrigins", () => {
  const [operation] = buildRemovalOperations({
    ...PRESETS.full,
    timeRange: "hour"
  }, 10_000_000);

  assert.equal(operation.options.excludeOrigins, undefined);
  assert.equal(operation.options.since, 10_000_000 - 60 * 60 * 1000);
});

test("Firefox invalid ranges are rejected", () => {
  assert.throws(() => getSinceFromRange("invalid", Date.now()), /Unsupported time range/);
});
