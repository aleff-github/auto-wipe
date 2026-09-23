# Auto Wipe

Auto Wipe is a small, dependency-free Chrome extension that clears selected browsing data automatically or on demand.

Everything runs locally in the browser. The extension has no backend, analytics, ads, or network requests.

## Features

- Clear browsing history.
- Clear browser cache.
- Clear Cache Storage used by web apps.
- Clear download history without deleting downloaded files.
- Choose a time range: last hour, last 24 hours, last 7 days, or all time.
- Run automatically on browser startup.
- Best-effort cleanup when the last browser window closes.
- Run a manual wipe from the popup.
- See when the last wipe ran.
- Light and dark mode.
- No third-party dependencies.

## Permissions

Auto Wipe requests only:

- `browsingData` — required to remove the selected browsing data.
- `storage` — required to save extension settings and the timestamp/result of the last wipe.

It does not request access to page contents, tabs, browsing URLs, downloads, or remote hosts.

## Privacy

Auto Wipe does not collect or transmit browsing data. Settings are stored with Chrome's extension storage APIs. The last wipe result is stored locally.

See [PRIVACY.md](PRIVACY.md).

## Install for development

1. Clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository directory.

No build step is required.

## Tests

The project uses Node's built-in test runner and has no npm dependencies.

```bash
npm test
```

## Project structure

```text
auto-wipe/
├── icons/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── service_worker.js
├── settings.js
├── wipe.js
└── tests/
    └── core.test.js
```

## Notes about automatic cleanup

The **last window closes** trigger is best effort. Manifest V3 service workers are event-driven and Chrome may terminate extension work during browser shutdown before cleanup completes.

For guaranteed cleanup while Chrome is running, use the manual action or the startup trigger.

## Security

Please report security issues according to [SECURITY.md](SECURITY.md).
