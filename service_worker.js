import { DEFAULT_SETTINGS, normalizeSettings } from "./settings.js";
import { buildDataToRemove, getSinceFromRange } from "./wipe.js";

let activeWipe = null;

async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return normalizeSettings(stored);
}

async function persistWipeResult(result) {
  await chrome.storage.local.set({
    lastWipe: {
      at: Date.now(),
      ...result
    }
  });
}

async function performWipe(reason) {
  const settings = await getSettings();
  const dataToRemove = buildDataToRemove(settings);
  const wiped = Object.keys(dataToRemove);

  if (wiped.length === 0) {
    const result = {
      ok: true,
      reason,
      wiped: [],
      timeRange: settings.timeRange
    };
    await persistWipeResult(result);
    return result;
  }

  const since = getSinceFromRange(settings.timeRange);
  await chrome.browsingData.remove({ since }, dataToRemove);

  const result = {
    ok: true,
    reason,
    wiped,
    timeRange: settings.timeRange
  };

  await persistWipeResult(result);
  console.info("[AutoWipe] Wipe completed.", result);
  return result;
}

function wipeSelected(reason) {
  if (activeWipe) {
    return activeWipe;
  }

  activeWipe = performWipe(reason)
    .catch(async (error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[AutoWipe] Wipe failed (${reason}):`, error);
      await chrome.storage.local.set({
        lastWipe: {
          at: Date.now(),
          ok: false,
          reason,
          error: message
        }
      });
      throw error;
    })
    .finally(() => {
      activeWipe = null;
    });

  return activeWipe;
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.sync.set(normalizeSettings(current));
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  if (!settings.triggerStartup) return;

  try {
    await wipeSelected("startup");
  } catch {
    // Failure is logged and persisted by wipeSelected.
  }
});

chrome.windows.onRemoved.addListener(async () => {
  const settings = await getSettings();
  if (!settings.triggerLastWindowClose) return;

  try {
    const remaining = await chrome.windows.getAll();
    if (remaining.length === 0) {
      await wipeSelected("lastWindowClosed");
    }
  } catch (error) {
    console.warn("[AutoWipe] Failed checking remaining windows:", error);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "WIPE_NOW") {
    wipeSelected("manual")
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });

    return true;
  }

  if (message?.type === "GET_STATUS") {
    chrome.storage.local
      .get("lastWipe")
      .then(({ lastWipe }) => sendResponse({ ok: true, lastWipe: lastWipe ?? null }))
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });

    return true;
  }

  return false;
});
