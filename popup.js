const DEFAULT_SETTINGS = {
  wipeHistory: true,
  wipeCache: true,
  wipeDownloads: true,
  triggerStartup: true,
  triggerLastWindowClose: true
};

const ids = [
  "wipeHistory",
  "wipeCache",
  "wipeDownloads",
  "triggerStartup",
  "triggerLastWindowClose"
];

function $(id) {
  return document.getElementById(id);
}

function setStatus(msg) {
  $("status").textContent = msg;
  if (msg) setTimeout(() => setStatus(""), 1400);
}

async function loadSettings() {
  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  for (const id of ids) {
    $(id).checked = Boolean(settings[id]);
  }
}

async function saveSettings() {
  const settings = {};
  for (const id of ids) {
    settings[id] = $(id).checked;
  }
  await chrome.storage.sync.set(settings);
  setStatus("Saved.");
}

function wireListeners() {
  for (const id of ids) {
    $(id).addEventListener("change", saveSettings);
  }

  $("wipeNow").addEventListener("click", async () => {
    $("wipeNow").disabled = true;
    setStatus("Wiping...");

    try {
      const result = await chrome.runtime.sendMessage({ type: "WIPE_NOW" });
      if (result && result.ok) {
        setStatus("Wipe completed.");
      } else {
        setStatus("Wipe failed.");
      }
    } catch (e) {
      setStatus("Wipe failed.");
    } finally {
      $("wipeNow").disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSettings();
  wireListeners();
});