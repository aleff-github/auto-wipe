# Privacy Policy

Auto Wipe is designed to work entirely inside the browser.

## Data collection

Auto Wipe does not collect, sell, share, or transmit personal data or browsing data.

The extension does not use analytics, advertising SDKs, remote APIs, telemetry, or tracking.

## Data stored by the extension

Auto Wipe stores:

- the cleanup options selected by the user, using `chrome.storage.sync`;
- information about the most recent cleanup attempt, using `chrome.storage.local`.

The most recent cleanup record can contain the timestamp, trigger, selected time range, names of data categories requested for deletion, and an error message if an operation failed. It does not contain browsing history entries, URLs, downloaded file names, or page contents.

## Browser data removal

When requested by the user or an enabled automatic trigger, Auto Wipe calls Chrome's `browsingData` API to remove the selected categories directly in the browser.

Clearing **download history** removes entries from Chrome's download list. It does not delete downloaded files from disk.
