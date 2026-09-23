import {
  DATA_SETTING_IDS,
  DEFAULT_SETTINGS,
  PRESETS,
  SETTING_IDS,
  applyPreset,
  normalizeSettings
} from "./settings.js";

let statusTimer = null;

function $(id) {
  return document.getElementById(id);
}

function setStatus(message, { clearAfter = 0, tone = "neutral" } = {}) {
  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }

  const status = $("status");
  status.textContent = message;
  status.dataset.tone = tone;

  if (message && clearAfter > 0) {
    statusTimer = setTimeout(() => {
      status.textContent = "";
      status.dataset.tone = "neutral";
      statusTimer = null;
    }, clearAfter);
  }
}

function readFormSettings() {
  const next = {};

  for (const id of SETTING_IDS) {
    next[id] = $(id).checked;
  }

  next.timeRange = $("timeRange").value;
  next.schedule = $("schedule").value;

  return normalizeSettings(next);
}

function writeFormSettings(settings) {
  for (const id of SETTING_IDS) {
    $(id).checked = settings[id];
  }

  $("timeRange").value = settings.timeRange;
  $("schedule").value = settings.schedule;
}

function selectedDataCount() {
  return DATA_SETTING_IDS.filter((id) => $(id).checked).length;
}

function updateButtonState() {
  $("wipeNow").disabled = selectedDataCount() === 0;
}

function updateSensitiveWarning() {
  const hasSensitiveSelection = [
    "wipeCookies",
    "wipeLocalStorage",
    "wipeIndexedDB",
    "wipeServiceWorkers"
  ].some((id) => $(id).checked);

  $("siteDataWarning").classList.toggle("hidden", !hasSensitiveSelection);
}

function updatePresetState() {
  const current = readFormSettings();

  document.querySelectorAll("[data-preset]").forEach((button) => {
    const preset = PRESETS[button.dataset.preset];
    const matches = DATA_SETTING_IDS.every((id) => current[id] === preset[id]);
    button.setAttribute("aria-pressed", String(matches));
  });
}

function formatLastWipe(lastWipe) {
  if (!lastWipe?.at) {
    return "No wipe recorded yet.";
  }

  const when = new Date(lastWipe.at).toLocaleString();

  if (!lastWipe.ok) {
    return `Last attempt failed · ${when}`;
  }

  if (!lastWipe.wiped?.length) {
    return `Last run: nothing selected · ${when}`;
  }

  return `Last wipe · ${when}`;
}

function formatNextSchedule(timestamp) {
  if (!timestamp) {
    return "";
  }

  return `Next scheduled wipe: ${new Date(timestamp).toLocaleString()}`;
}

async function refreshStatusDetails() {
  try {
    const response = await browser.runtime.sendMessage({ type: "GET_STATUS" });
    $("lastWipe").textContent = formatLastWipe(response?.lastWipe);
    $("nextSchedule").textContent = formatNextSchedule(response?.nextScheduledWipe);
  } catch {
    $("lastWipe").textContent = "";
    $("nextSchedule").textContent = "";
  }
}

async function loadSettings() {
  const stored = await browser.storage.sync.get(DEFAULT_SETTINGS);
  const settings = normalizeSettings(stored);

  writeFormSettings(settings);
  updateButtonState();
  updateSensitiveWarning();
  updatePresetState();
}

async function saveSettings({ message = "Settings saved." } = {}) {
  const settings = readFormSettings();

  try {
    await browser.storage.sync.set(settings);
    await browser.runtime.sendMessage({ type: "SYNC_SCHEDULE" });
    setStatus(message, { clearAfter: 1600 });
  } catch {
    setStatus("Could not save settings.", { clearAfter: 3000, tone: "error" });
  }

  updateButtonState();
  updateSensitiveWarning();
  updatePresetState();
  await refreshStatusDetails();
}

async function applySelectedPreset(name) {
  const next = applyPreset(name, readFormSettings());
  writeFormSettings(next);
  await saveSettings({
    message: `${name[0].toUpperCase() + name.slice(1)} preset applied.`
  });
}

function setWiping(isWiping) {
  const button = $("wipeNow");
  button.classList.toggle("loading", isWiping);
  button.disabled = isWiping || selectedDataCount() === 0;
  button.setAttribute("aria-busy", String(isWiping));
}

async function wipeNow() {
  setWiping(true);
  setStatus("Wiping selected data…");

  try {
    const result = await browser.runtime.sendMessage({ type: "WIPE_NOW" });

    if (result?.ok) {
      const count = result.wiped?.length ?? 0;
      setStatus(
        count > 0
          ? `Wipe completed · ${count} data type${count === 1 ? "" : "s"} cleared.`
          : "Nothing selected to wipe.",
        { clearAfter: 3500, tone: "success" }
      );
      await refreshStatusDetails();
    } else {
      setStatus("Wipe failed.", { clearAfter: 4000, tone: "error" });
    }
  } catch {
    setStatus("Wipe failed.", { clearAfter: 4000, tone: "error" });
  } finally {
    setWiping(false);
  }
}

function wireListeners() {
  for (const id of SETTING_IDS) {
    $(id).addEventListener("change", () => saveSettings());
  }

  $("timeRange").addEventListener("change", () => saveSettings());
  $("schedule").addEventListener("change", () => saveSettings());

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applySelectedPreset(button.dataset.preset));
  });

  $("wipeNow").addEventListener("click", wipeNow);
}

document.addEventListener("DOMContentLoaded", async () => {
  wireListeners();

  try {
    await Promise.all([loadSettings(), refreshStatusDetails()]);
  } catch {
    setStatus("Could not load settings.", { tone: "error" });
  }
});
