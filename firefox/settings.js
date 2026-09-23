export const DATA_SETTING_IDS = Object.freeze([
  "wipeHistory",
  "wipeCache",
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

export const SCHEDULE_MINUTES = Object.freeze({
  hourly: 60,
  daily: 24 * 60,
  weekly: 7 * 24 * 60
});

export const PRESETS = Object.freeze({
  light: Object.freeze({
    wipeHistory: false,
    wipeCache: true,
    wipeDownloads: false,
    wipeCookies: false,
    wipeLocalStorage: false,
    wipeIndexedDB: false,
    wipeServiceWorkers: false
  }),
  standard: Object.freeze({
    wipeHistory: true,
    wipeCache: true,
    wipeDownloads: true,
    wipeCookies: false,
    wipeLocalStorage: false,
    wipeIndexedDB: false,
    wipeServiceWorkers: false
  }),
  full: Object.freeze({
    wipeHistory: true,
    wipeCache: true,
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
  schedule: "off"
});

export function normalizeSettings(value = {}) {
  const settings = { ...DEFAULT_SETTINGS };

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
