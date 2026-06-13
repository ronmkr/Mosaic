/**
 * @fileoverview Search engine selection and management for Mosaic Home.
 */

import { state } from './state.js';
import { DOM } from './dom.js';
import { SEARCH_ENGINES } from './searchEngines.js';

/**
 * Sets the active search engine by key.
 */
export function setSearchEngine(key) {
  if (!SEARCH_ENGINES[key]) return;
  state.currentEngine = key;
  DOM.currentEngineIcon.innerHTML = SEARCH_ENGINES[key].icon;
  renderEngineDropdown();

  if (chrome.storage) {
    chrome.storage.local.set({ preferredEngine: key });
  }
}

/**
 * Cycles to the next available search engine.
 */
export function cycleSearchEngine() {
  const keys = Object.keys(SEARCH_ENGINES);
  const currentIndex = keys.indexOf(state.currentEngine);
  const nextIndex = (currentIndex + 1) % keys.length;
  setSearchEngine(keys[nextIndex]);
}

/**
 * Renders the search engine selection dropdown menu.
 */
export function renderEngineDropdown() {
  DOM.engineDropdown.innerHTML = '';
  Object.keys(SEARCH_ENGINES).forEach((key) => {
    const engine = SEARCH_ENGINES[key];
    const btn = document.createElement('button');
    btn.className = `engine-option ${state.currentEngine === key ? 'active' : ''}`;
    btn.innerHTML = `
      ${engine.icon}
      <span>${engine.name}</span>
    `;
    btn.onclick = () => {
      setSearchEngine(key);
      DOM.engineDropdown.classList.add('hidden');
      DOM.searchInput.focus();
    };
    DOM.engineDropdown.appendChild(btn);
  });
}
