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
  if (settings.wipeDownloads) data.downloads = true;
  if (settings.wipeCookies) data.cookies = true;
  if (settings.wipeLocalStorage) data.localStorage = true;
  if (settings.wipeIndexedDB) data.indexedDB = true;
  if (settings.wipeServiceWorkers) data.serviceWorkers = true;

  return data;
}

export function buildRemovalOperations(settings, now = Date.now()) {
  const data = buildDataToRemove(settings);

  if (Object.keys(data).length === 0) {
    return [];
  }

  return [{
    options: {
      since: getSinceFromRange(settings.timeRange, now)
    },
    data
  }];
}
