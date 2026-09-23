# Auto Wipe

Auto Wipe is a dependency-free browser extension that clears selected browsing data automatically or on demand.

The repository contains two self-contained browser builds:

```text
auto-wipe/
├── chrome/     # Google Chrome / Chromium build
├── firefox/    # Mozilla Firefox build
├── tests/
├── README.md
├── PRIVACY.md
├── SECURITY.md
└── package.json
```

You can load either browser folder directly. No build step is required.

## Browser support

| Feature | Chrome | Firefox |
| --- | :---: | :---: |
| Browsing history | ✓ | ✓ |
| Browser cache | ✓ | ✓ |
| Download history | ✓ | ✓ |
| Cookies | ✓ | ✓ |
| Local Storage | ✓ | ✓ |
| IndexedDB | ✓ | ✓ |
| Service workers | ✓ | ✓ |
| Cache Storage as a separate data type | ✓ | — |
| Protected-site exclusions | ✓ | — |
| Hourly / daily / weekly schedule | ✓ | ✓ |
| Startup wipe | ✓ | ✓ |
| Last-window-close wipe | Best effort | Best effort |

Firefox currently does not implement Chromium's `cacheStorage` browsing-data type or the `excludeOrigins` option used by Auto Wipe's protected-sites feature. The Firefox UI therefore does not expose controls that the browser cannot reliably honor.

## Chrome

The Chrome build is in [`chrome/`](chrome/).

To load it locally:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `chrome` directory.

Chrome uses a Manifest V3 background service worker.

## Firefox

The Firefox build is in [`firefox/`](firefox/).

To test it locally:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select `firefox/manifest.json`.

Firefox uses a Manifest V3 non-persistent background script/event page rather than an extension service worker.

The Firefox manifest includes a stable Gecko add-on ID and declares `data_collection_permissions.required: ["none"]` for AMO compatibility.

## Privacy

Everything runs locally. Auto Wipe has no backend, analytics, ads, telemetry, or network requests.

See [PRIVACY.md](PRIVACY.md).

## Tests

The project uses Node's built-in test runner and has no npm dependencies.

```bash
npm test
```

The tests cover the Chrome cleanup planner, Firefox cleanup planner, presets, time ranges, manifest separation, and browser-specific capability boundaries.

## Maintenance rule

The browser folders are intentionally independent packages. Cross-browser behavior should stay aligned where the APIs are equivalent, but browser-specific code must not pretend unsupported APIs exist.

## Security

Please report security issues according to [SECURITY.md](SECURITY.md).
