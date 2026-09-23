const RANGE_MS = Object.freeze({
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000
});

export function getSinceFromRange(timeRange, now = Date.now()) {
  if (timeRange === "allTime") {
    return 0;
  }

  const duration = RANGE_MS[timeRange];
  if (!duration) {
    throw new Error(`Unsupported time range: ${timeRange}`);
  }

  return Math.max(0, now - duration);
}

export function buildDataToRemove(settings) {
  const data = {};

  if (settings.wipeHistory) data.history = true;
  if (settings.wipeCache) data.cache = true;
  if (settings.wipeCacheStorage) data.cacheStorage = true;
  if (settings.wipeDownloads) data.downloads = true;

  return data;
}
