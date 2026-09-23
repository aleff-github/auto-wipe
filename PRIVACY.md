# Privacy Policy

Auto Wipe is designed to work entirely inside the browser.

## Data collection

Auto Wipe does not collect, sell, share, or transmit personal data or browsing data.

The extension does not use analytics, advertising SDKs, remote APIs, telemetry, or tracking.

## Data stored by the extension

Auto Wipe stores its settings with `chrome.storage.sync`. These settings can include:

- selected cleanup categories;
- time range;
- enabled automatic triggers;
- cleanup schedule;
- website origins the user explicitly adds to the protected-sites list.

Protected-site entries are configuration supplied by the user. Auto Wipe does not discover or populate this list from browsing history.

Information about the most recent cleanup attempt is stored with `chrome.storage.local`. The record can contain the timestamp, trigger, selected time range, names of data categories requested for deletion, the number of protected origins, and an error message if an operation failed.

The last-wipe record does not contain browsing history entries, URLs, downloaded file names, cookies, or page contents.

## Browser data removal

When requested by the user or an enabled automatic trigger, Auto Wipe calls Chrome's `browsingData` API to remove the selected categories directly in the browser.

Clearing **download history** removes entries from Chrome's download list. It does not delete downloaded files from disk.

Protected sites are excluded only from data categories for which Chrome supports origin exclusions: cookies, cache, Cache Storage, Local Storage, IndexedDB, and service workers. Browsing history and download history do not support this exclusion and are cleared globally when selected.

## Scheduling

Optional periodic cleanup uses Chrome's `alarms` API. No external service is contacted to run scheduled wipes.
