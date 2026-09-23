import {
  DEFAULT_SETTINGS,
  SCHEDULE_MINUTES,
  normalizeSettings
} from "./settings.js";
import {
  buildDataToRemove,
  buildRemovalOperations
} from "./wipe.js";

const AUTO_WIPE_ALARM = "auto-wipe-schedule";

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

async function configureSchedule(settings = null) {
  const resolved = settings ?? await getSettings();
  await chrome.alarms.clear(AUTO_WIPE_ALARM);

  const periodInMinutes = SCHEDULE_MINUTES[resolved.schedule];
  if (!periodInMinutes) return null;

  chrome.alarms.create(AUTO_WIPE_ALARM, {
    delayInMinutes: periodInMinutes,
    periodInMinutes
  });

  return chrome.alarms.get(AUTO_WIPE_ALARM);
}

async function performWipe(reason) {
  const settings = await getSettings();
  const dataToRemove = buildDataToRemove(settings);
  const wiped = Object.keys(dataToRemove);
  const operations = buildRemovalOperations(settings);

  if (operations.length === 0) {
    const result = {
      ok: true,
      reason,
      wiped: [],
      timeRange: settings.timeRange,
      protectedOrigins: settings.protectedOrigins.length
    };
    await persistWipeResult(result);
    return result;
  }

  for (const operation of operations) {
    await chrome.browsingData.remove(operation.options, operation.data);
  }

  const result = {
    ok: true,
    reason,
    wiped,
    timeRange: settings.timeRange,
    protectedOrigins: settings.protectedOrigins.length
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
  const settings = normalizeSettings(current);
  await chrome.storage.sync.set(settings);
  await configureSchedule(settings);
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  await configureSchedule(settings);

  if (!settings.triggerStartup) return;

  try {
    await wipeSelected("startup");
  } catch {
    // Failure is logged and persisted by wipeSelected.
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== AUTO_WIPE_ALARM) return;

  try {
    await wipeSelected("scheduled");
  } catch {
    // Failure is logged and persisted by wipeSelected.
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes.schedule) return;

  getSettings()
    .then(configureSchedule)
    .catch((error) => {
      console.warn("[AutoWipe] Failed updating schedule:", error);
    });
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

  if (message?.type === "SYNC_SCHEDULE") {
    getSettings()
      .then(configureSchedule)
      .then((alarm) => {
        sendResponse({
          ok: true,
          nextScheduledWipe: alarm?.scheduledTime ?? null
        });
      })
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        });
      });

    return true;
  }

  if (message?.type === "GET_STATUS") {
    Promise.all([
      chrome.storage.local.get("lastWipe"),
      chrome.alarms.get(AUTO_WIPE_ALARM)
    ])
      .then(([{ lastWipe }, alarm]) => {
        sendResponse({
          ok: true,
          lastWipe: lastWipe ?? null,
          nextScheduledWipe: alarm?.scheduledTime ?? null
        });
      })
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
