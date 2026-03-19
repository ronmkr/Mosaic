import { DEFAULT_SVG } from './constants.js';

export function getIconUrl(pageUrl, size) {
  if (!pageUrl) return DEFAULT_SVG;
  try {
    const parsed = new URL(pageUrl);
    const protocol = parsed.protocol.toLowerCase();

    if (
      protocol === 'chrome:' ||
      protocol === 'chrome-extension:' ||
      protocol === 'file:' ||
      protocol === 'about:'
    ) {
      return DEFAULT_SVG;
    }

    // In Manifest V3, we must use the chrome-extension://[id]/_favicon/ endpoint
    if (!chrome || !chrome.runtime || !chrome.runtime.id) {
      return DEFAULT_SVG;
    }
    const url = new URL(`chrome-extension://${chrome.runtime.id}/_favicon/`);
    url.searchParams.set('pageUrl', pageUrl);
    url.searchParams.set('size', size);
    return url.toString();
  } catch (e) {
    return DEFAULT_SVG;
  }
}

export function openInternalUrl(url) {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.toLowerCase();

    if (
      protocol === 'chrome:' ||
      protocol === 'chrome-extension:' ||
      protocol === 'file:' ||
      protocol === 'about:'
    ) {
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

/**
 * Compresses an image to a maximum dimension and quality.
 * @param {string} dataUrl - The original base64 data URL.
 * @param {number} maxWidth - Max width in pixels.
 * @param {number} quality - Quality from 0 to 1.
 * @returns {Promise<string>} - Compressed base64 data URL.
 */
export async function compressImage(dataUrl, maxWidth = 1920, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
  });
}

/**
 * Limits the rate at which a function can fire.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
