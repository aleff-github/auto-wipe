// Auto Wipe - Manifest V3 service worker
// Wipes selected browsing data on selected triggers, plus on-demand via popup.

const DEFAULT_SETTINGS = {
  wipeHistory: true,
  wipeCache: true,
  wipeDownloads: true,
  triggerStartup: true,
  triggerLastWindowClose: true
};

async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

function buildDataToRemove(settings) {
  const data = {};

  if (settings.wipeHistory) data.history = true;
  if (settings.wipeDownloads) data.downloads = true;

  if (settings.wipeCache) {
    data.cache = true;
    data.cacheStorage = true;
  }

  return data;
}

async function wipeSelected(reason) {
  const settings = await getSettings();
  const dataToRemove = buildDataToRemove(settings);

  if (!Object.keys(dataToRemove).length) {
    console.log(`[AutoWipe] Nothing selected to wipe (${reason}).`);
    return { ok: true, reason, wiped: [] };
  }

  await chrome.browsingData.remove({ since: 0 }, dataToRemove);
  console.log(`[AutoWipe] Wipe completed (${reason}).`, dataToRemove);

  return { ok: true, reason, wiped: Object.keys(dataToRemove) };
}

// Initialize defaults on install (only if not already set)
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(null);
  if (!current || Object.keys(current).length === 0) {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
});

// Trigger: browser startup
chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  if (settings.triggerStartup) {
    try {
      await wipeSelected("onStartup");
    } catch (err) {
      console.warn("[AutoWipe] Wipe failed (onStartup):", err);
    }
  }
});

// Trigger: best-effort when last window closes
chrome.windows.onRemoved.addListener(async () => {
  const settings = await getSettings();
  if (!settings.triggerLastWindowClose) return;

  try {
    const remaining = await chrome.windows.getAll();
    if (!remaining || remaining.length === 0) {
      await wipeSelected("lastWindowClosed");
    }
  } catch (err) {
    console.warn("[AutoWipe] Failed checking remaining windows:", err);
  }
});

// On-demand wipe triggered from the popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "WIPE_NOW") {
    (async () => {
      try {
        const result = await wipeSelected("wipeNow");
        sendResponse(result);
      } catch (err) {
        console.warn("[AutoWipe] Wipe failed (wipeNow):", err);
        sendResponse({ ok: false, error: String(err) });
      }
    })();
    return true; // keep the message channel open for async response
  }
});