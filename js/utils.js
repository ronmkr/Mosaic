import { DEFAULT_SVG } from './constants.js';

export function getIconUrl(pageUrl, size) {
    if (!pageUrl) return DEFAULT_SVG;
    try {
        const parsed = new URL(pageUrl);
        const protocol = parsed.protocol.toLowerCase();
        
        if (protocol === 'chrome:' || protocol === 'chrome-extension:' || protocol === 'file:' || protocol === 'about:') {
            return DEFAULT_SVG;
        }

        // In Manifest V3, we must use the chrome-extension://[id]/_favicon/ endpoint
        const url = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
        url.searchParams.set("pageUrl", pageUrl);
        url.searchParams.set("size", size);
        return url.toString();
    } catch (e) {
        return DEFAULT_SVG;
    }
}

export function openInternalUrl(url) {
    try {
        const parsed = new URL(url);
        const protocol = parsed.protocol.toLowerCase();
        
        if (protocol === 'chrome:' || protocol === 'chrome-extension:' || protocol === 'file:' || protocol === 'about:') {
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url });
                return true;
            }
        }
    } catch (err) {
        // Ignore parse errors
    }
    return false;
}
