export const DATA_SETTING_IDS = Object.freeze([
  "wipeHistory",
  "wipeCache",
  "wipeCacheStorage",
  "wipeDownloads",
  "wipeCookies",
  "wipeLocalStorage",
  "wipeIndexedDB",
  "wipeServiceWorkers"
]);

export const TRIGGER_SETTING_IDS = Object.freeze([
  "triggerStartup",
  "triggerLastWindowClose"
]);

export const SETTING_IDS = Object.freeze([
  ...DATA_SETTING_IDS,
  ...TRIGGER_SETTING_IDS
]);

export const TIME_RANGES = Object.freeze(["allTime", "hour", "day", "week"]);
export const SCHEDULES = Object.freeze(["off", "hourly", "daily", "weekly"]);
export const MAX_PROTECTED_ORIGINS = 50;

export const SCHEDULE_MINUTES = Object.freeze({
  hourly: 60,
  daily: 24 * 60,
  weekly: 7 * 24 * 60
});

export const PRESETS = Object.freeze({
  light: Object.freeze({
    wipeHistory: false,
    wipeCache: true,
    wipeCacheStorage: true,
    wipeDownloads: false,
    wipeCookies: false,
    wipeLocalStorage: false,
    wipeIndexedDB: false,
    wipeServiceWorkers: false
  }),
  standard: Object.freeze({
    wipeHistory: true,
    wipeCache: true,
    wipeCacheStorage: true,
    wipeDownloads: true,
    wipeCookies: false,
    wipeLocalStorage: false,
    wipeIndexedDB: false,
    wipeServiceWorkers: false
  }),
  full: Object.freeze({
    wipeHistory: true,
    wipeCache: true,
    wipeCacheStorage: true,
    wipeDownloads: true,
    wipeCookies: true,
    wipeLocalStorage: true,
    wipeIndexedDB: true,
    wipeServiceWorkers: true
  })
});

export const DEFAULT_SETTINGS = Object.freeze({
  ...PRESETS.standard,
  triggerStartup: true,
  triggerLastWindowClose: true,
  timeRange: "allTime",
  schedule: "off",
  protectedOrigins: Object.freeze([])
});

export function normalizeProtectedOrigins(value = []) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const candidate of value) {
    if (result.length >= MAX_PROTECTED_ORIGINS) break;
    if (typeof candidate !== "string") continue;

    const trimmed = candidate.trim();
    if (!trimmed) continue;

    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      const url = new URL(withScheme);
      if (!["http:", "https:"].includes(url.protocol)) continue;

      const origin = url.origin;
      if (!seen.has(origin)) {
        seen.add(origin);
        result.push(origin);
      }
    } catch {
      // Ignore invalid entries.
    }
  }

  return result;
}

export function normalizeSettings(value = {}) {
  const settings = {
    ...DEFAULT_SETTINGS,
    protectedOrigins: []
  };

  for (const id of SETTING_IDS) {
    if (typeof value[id] === "boolean") {
      settings[id] = value[id];
    }
  }

  if (TIME_RANGES.includes(value.timeRange)) {
    settings.timeRange = value.timeRange;
  }

  if (SCHEDULES.includes(value.schedule)) {
    settings.schedule = value.schedule;
  }

  settings.protectedOrigins = normalizeProtectedOrigins(value.protectedOrigins);
  return settings;
}

export function applyPreset(name, current = {}) {
  const preset = PRESETS[name];
  if (!preset) {
    throw new Error(`Unknown preset: ${name}`);
  }

  return {
    ...normalizeSettings(current),
    ...preset
  };
}
