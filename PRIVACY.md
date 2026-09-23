# Privacy Policy

Auto Wipe is designed to work entirely inside the browser.

## Data collection

Auto Wipe does not collect, sell, share, or transmit personal data or browsing data.

The extension does not use analytics, advertising SDKs, remote APIs, telemetry, or tracking.

## Data stored by the extension

Both browser builds store their cleanup settings using the browser's extension storage API. Settings can include:

- selected cleanup categories;
- time range;
- enabled automatic triggers;
- cleanup schedule.

The Chrome build can additionally store website origins the user explicitly adds to the protected-sites list. Firefox does not expose this feature because Firefox does not currently support the required `excludeOrigins` browsing-data option.

Protected-site entries are configuration supplied by the user. Auto Wipe does not discover or populate them from browsing history.

Information about the most recent cleanup attempt is stored locally. The record can contain the timestamp, trigger, selected time range, names of data categories requested for deletion, and an error message if an operation failed.

The last-wipe record does not contain browsing history entries, visited URLs, downloaded file names, cookies, or page contents.

## Browser data removal

When requested by the user or an enabled automatic trigger, Auto Wipe calls the browser's `browsingData` API to remove the selected categories directly in the browser.

Clearing **download history** removes entries from the browser's download list. It does not delete downloaded files from disk.

On Chrome, protected sites are excluded only from data categories for which Chromium supports origin exclusions. Browsing history and download history are still cleared globally when selected.

## Scheduling

Optional periodic cleanup uses the browser's `alarms` API. No external service is contacted to run scheduled wipes.
