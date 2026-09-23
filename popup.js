import { DEFAULT_SETTINGS, SETTING_IDS, normalizeSettings } from "./settings.js";

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

function selectedDataCount() {
  return ["wipeHistory", "wipeCache", "wipeCacheStorage", "wipeDownloads"]
    .filter((id) => $(id).checked).length;
}

function updateButtonState() {
  $("wipeNow").disabled = selectedDataCount() === 0;
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

async function refreshLastWipe() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
    $("lastWipe").textContent = formatLastWipe(response?.lastWipe);
  } catch {
    $("lastWipe").textContent = "";
  }
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const settings = normalizeSettings(stored);

  for (const id of SETTING_IDS) {
    $(id).checked = settings[id];
  }

  $("timeRange").value = settings.timeRange;
  updateButtonState();
}

async function saveSettings() {
  const next = {};

  for (const id of SETTING_IDS) {
    next[id] = $(id).checked;
  }

  next.timeRange = $("timeRange").value;

  try {
    await chrome.storage.sync.set(normalizeSettings(next));
    setStatus("Settings saved.", { clearAfter: 1400 });
  } catch {
    setStatus("Could not save settings.", { clearAfter: 3000, tone: "error" });
  }

  updateButtonState();
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
    const result = await chrome.runtime.sendMessage({ type: "WIPE_NOW" });

    if (result?.ok) {
      const count = result.wiped?.length ?? 0;
      setStatus(
        count > 0 ? `Wipe completed · ${count} data type${count === 1 ? "" : "s"} cleared.` : "Nothing selected to wipe.",
        { clearAfter: 3500, tone: "success" }
      );
      await refreshLastWipe();
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
    $(id).addEventListener("change", saveSettings);
  }

  $("timeRange").addEventListener("change", saveSettings);
  $("wipeNow").addEventListener("click", wipeNow);
}

document.addEventListener("DOMContentLoaded", async () => {
  wireListeners();

  try {
    await Promise.all([loadSettings(), refreshLastWipe()]);
  } catch {
    setStatus("Could not load settings.", { tone: "error" });
  }
});
