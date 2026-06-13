/**
 * @fileoverview Background image management for Mosaic Home.
 */

import { DOM } from './dom.js';
import { compressImage } from './utils.js';

/**
 * Handles image upload, compression, and persistence.
 */
export async function handleImageUpload(e, updateDashboardBackground) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert('Please choose an image smaller than 10MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const rawBase64 = event.target.result;
    try {
      const compressedBase64 = await compressImage(rawBase64, 1920, 0.7);
      updateDashboardBackground(compressedBase64);
      if (chrome.storage) {
        chrome.storage.local.set({ backgroundImage: compressedBase64 });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Compression failed', err);
      updateDashboardBackground(rawBase64);
      if (chrome.storage) {
        chrome.storage.local.set({ backgroundImage: rawBase64 });
      }
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Resets the dashboard background to default.
 */
export async function resetBackground(updateDashboardBackground) {
  if (confirm('Are you sure you want to reset the background image?')) {
    if (chrome.storage) {
      await new Promise((resolve) => {
        chrome.storage.local.remove('backgroundImage', resolve);
      });
      updateDashboardBackground('');
    }
  }
}

/**
 * Updates the visual background overlay.
 */
export function updateDashboardBackground(url) {
  if (DOM.bgOverlay) {
    if (url) {
      DOM.bgOverlay.style.backgroundImage = `url(${url})`;
      document.body.classList.add('has-bg');
    } else {
      DOM.bgOverlay.style.backgroundImage = '';
      document.body.classList.remove('has-bg');
    }
  }
}
