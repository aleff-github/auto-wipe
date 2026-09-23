const RANGE_MS = Object.freeze({
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000
});

const ORIGIN_AWARE_KEYS = new Set([
  "cache",
  "cacheStorage",
  "cookies",
  "indexedDB",
  "localStorage",
  "serviceWorkers"
]);

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
  if (settings.wipeCookies) data.cookies = true;
  if (settings.wipeLocalStorage) data.localStorage = true;
  if (settings.wipeIndexedDB) data.indexedDB = true;
  if (settings.wipeServiceWorkers) data.serviceWorkers = true;

  return data;
}

export function buildRemovalOperations(settings, now = Date.now()) {
  const data = buildDataToRemove(settings);
  const entries = Object.entries(data);

  if (entries.length === 0) {
    return [];
  }

  const since = getSinceFromRange(settings.timeRange, now);
  const protectedOrigins = Array.isArray(settings.protectedOrigins)
    ? settings.protectedOrigins
    : [];

  if (protectedOrigins.length === 0) {
    return [{
      options: { since },
      data
    }];
  }

  const originAwareData = {};
  const globalData = {};

  for (const [key, enabled] of entries) {
    if (ORIGIN_AWARE_KEYS.has(key)) {
      originAwareData[key] = enabled;
    } else {
      globalData[key] = enabled;
    }
  }

  const operations = [];

  if (Object.keys(originAwareData).length > 0) {
    operations.push({
      options: {
        since,
        excludeOrigins: protectedOrigins
      },
      data: originAwareData
    });
  }

  if (Object.keys(globalData).length > 0) {
    operations.push({
      options: { since },
      data: globalData
    });
  }

  return operations;
}
