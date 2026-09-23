# Auto Wipe for Firefox

This directory is a self-contained Manifest V3 Firefox WebExtension.

## Temporary local installation

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select this directory's `manifest.json`.

Firefox runs the background code as a non-persistent background script/event page.

## Firefox-specific differences

Firefox does not currently support the `excludeOrigins` option used by the Chrome protected-sites feature, so protected sites are intentionally absent from this build.

Firefox also does not expose Chromium's separate `cacheStorage` browsing-data type. Cache Storage is therefore not presented as a separate cleanup category.

The manifest declares no data collection or transmission through `browser_specific_settings.gecko.data_collection_permissions`.
