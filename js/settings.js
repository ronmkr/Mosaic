/**
 * @fileoverview Settings management for Mosaic Home.
 */

import { state } from './state.js';
import { DOM } from './dom.js';

/**
 * Loads all settings from chrome storage and applies them.
 */
export async function loadSettings(updateDashboardBackground, setSearchEngine) {
  if (!chrome.storage) return;
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['backgroundImage', 'backdropBlur', 'userName', 'reduceMotion', 'preferredEngine', 'hideBookmarksBar'],
      (result) => {
        updateDashboardBackground(result.backgroundImage || '');
        if (result.backdropBlur !== undefined) {
          DOM.blurSlider.value = result.backdropBlur;
          document.documentElement.style.setProperty('--bg-blur', `${result.backdropBlur}px`);
        }
        if (result.userName) {
          DOM.userNameInput.value = result.userName;
        }
        if (result.reduceMotion !== undefined) {
          DOM.motionToggle.checked = result.reduceMotion;
          document.body.classList.toggle('no-animations', result.reduceMotion);
        }
        if (result.preferredEngine) {
          setSearchEngine(result.preferredEngine);
        }
        if (result.hideBookmarksBar !== undefined) {
          state.hideBookmarksBar = result.hideBookmarksBar;
          DOM.hideBookmarksBarToggle.checked = result.hideBookmarksBar;
        }
        resolve();
      }
    );
  });
}

/**
 * Exports current storage content to a JSON file.
 */
export function exportSettings() {
  if (!chrome.storage) return;
  chrome.storage.local.get(null, (items) => {
    const dataStr = JSON.stringify(items);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mosaic-backup.json';
    a.click();
    
    URL.revokeObjectURL(url);
  });
}

/**
 * Imports settings from a JSON file and refreshes the UI.
 */
export function importSettings(e, loadSettingsCallback, closeSettingsCallback) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const items = JSON.parse(event.target.result);
      if (chrome.storage && typeof items === 'object') {
        chrome.storage.local.set(items, () => {
          alert('Settings imported successfully!');
          loadSettingsCallback();
          closeSettingsCallback();
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse settings backup', err);
      alert('Invalid backup file.');
    }
  };
  reader.readAsText(file);
}
