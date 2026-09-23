# Auto Wipe

Auto Wipe is a small, dependency-free Chrome extension that clears selected browsing data automatically or on demand.

Everything runs locally in the browser. The extension has no backend, analytics, ads, or network requests.

## Features

- Three presets: **Light**, **Standard**, and **Full**.
- Clear browsing history and download history.
- Clear cache and Cache Storage.
- Optionally clear cookies, Local Storage, IndexedDB, and service workers.
- Choose a time range: last hour, last 24 hours, last 7 days, or all time.
- Protect up to 50 website origins from supported cache/cookie/site-storage cleanup.
- Run automatically on browser startup.
- Schedule cleanup hourly, daily, or weekly.
- Best-effort cleanup when the last browser window closes.
- Run a manual wipe from the popup.
- See the last wipe and the next scheduled wipe.
- Light and dark mode.
- No third-party dependencies.

## Presets

| Preset | Cleans |
| --- | --- |
| Light | Cache and Cache Storage |
| Standard | History, cache, Cache Storage, and download history |
| Full | Standard plus cookies, Local Storage, IndexedDB, and service workers |

Presets only change the selected data categories. They do not change your time range, automatic triggers, schedule, or protected sites.

## Protected sites

Protected sites use Chrome's origin-exclusion support. Enter one site per line, for example:

```text
example.com
https://mail.example.org
```

Paths are discarded and entries are stored as origins.

Chrome only supports origin exclusions for cookies, cache, and site storage. **Browsing history and download history are still cleared globally** when those categories are enabled.

Cookie exclusions apply to the registrable domain, which can be broader than a single subdomain.

## Permissions

Auto Wipe requests only:

- `browsingData` — removes the selected browsing data.
- `storage` — saves settings and the most recent wipe status.
- `alarms` — runs optional hourly, daily, or weekly cleanup.

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

Scheduled cleanup uses Chrome's alarms API. Alarms do not wake a sleeping device; a missed repeating alarm runs after the device wakes and is then rescheduled.

## Security

Please report security issues according to [SECURITY.md](SECURITY.md).
