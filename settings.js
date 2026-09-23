export const DEFAULT_SETTINGS = Object.freeze({
  wipeHistory: true,
  wipeCache: true,
  wipeCacheStorage: true,
  wipeDownloads: true,
  triggerStartup: true,
  triggerLastWindowClose: true,
  timeRange: "allTime"
});

export const SETTING_IDS = Object.freeze([
  "wipeHistory",
  "wipeCache",
  "wipeCacheStorage",
  "wipeDownloads",
  "triggerStartup",
  "triggerLastWindowClose"
]);

export const TIME_RANGES = Object.freeze(["allTime", "hour", "day", "week"]);

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

  return settings;
}
