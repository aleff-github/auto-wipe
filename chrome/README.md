# Auto Wipe for Chrome

This directory is a self-contained Manifest V3 Chrome extension.

## Local installation

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this `chrome` directory.

The build uses a Manifest V3 background service worker and requests only `alarms`, `browsingData`, and `storage`.
