import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

test("Chrome and Firefox are separate self-contained extension roots", () => {
  assert.equal(fs.existsSync(path.join(root, "chrome", "manifest.json")), true);
  assert.equal(fs.existsSync(path.join(root, "firefox", "manifest.json")), true);
});

test("Chrome manifest uses a service worker", () => {
  const manifest = readJson("chrome/manifest.json");

  assert.equal(manifest.version, "1.3.0");
  assert.equal(manifest.background.service_worker, "service_worker.js");
  assert.equal(manifest.background.type, "module");
  assert.equal("scripts" in manifest.background, false);
  assert.deepEqual(manifest.permissions, ["alarms", "browsingData", "storage"]);
});

test("Firefox manifest uses a module background script and AMO privacy declaration", () => {
  const manifest = readJson("firefox/manifest.json");

  assert.equal(manifest.version, "1.3.0");
  assert.deepEqual(manifest.background.scripts, ["background.js"]);
  assert.equal(manifest.background.type, "module");
  assert.equal("service_worker" in manifest.background, false);
  assert.equal("key" in manifest, false);
  assert.equal(manifest.browser_specific_settings.gecko.id, "auto-wipe@aleff-github.github.io");
  assert.deepEqual(
    manifest.browser_specific_settings.gecko.data_collection_permissions.required,
    ["none"]
  );
  assert.deepEqual(manifest.permissions, ["alarms", "browsingData", "storage"]);
});

test("both builds contain all required icons", () => {
  for (const browserName of ["chrome", "firefox"]) {
    for (const size of [16, 32, 48, 128]) {
      assert.equal(
        fs.existsSync(path.join(root, browserName, "icons", `icon${size}.png`)),
        true
      );
    }
  }
});

test("repository root is no longer an extension root", () => {
  assert.equal(fs.existsSync(path.join(root, "manifest.json")), false);
});
