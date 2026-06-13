/**
 * @fileoverview Mosaic Home - Main Application Controller (Orchestrator)
 */

import { state } from './state.js';
import { DOM } from './dom.js';
import { renderGrid } from './ui.js';
import { initClock } from './widgets.js';
import { debounce } from './utils.js';
import { initContextMenu } from './contextMenu.js';
import { SEARCH_ENGINES } from './searchEngines.js';
import { searchRecursive } from './search.js';
import { loadSettings, exportSettings, importSettings } from './settings.js';
import { handleImageUpload, resetBackground, updateDashboardBackground } from './backgroundManager.js';

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  initClock();
  initContextMenu();
  setupBookmarksListeners();
  setupUserInterfaceListeners();

  setSearchEngine(state.currentEngine); 
  renderEngineDropdown();

  await Promise.all([
    loadSettings(updateDashboardBackground, setSearchEngine),
    refreshBookmarksView()
  ]);
}

async function refreshBookmarksView() {
  if (!chrome.bookmarks) return;

  return new Promise((resolve) => {
    chrome.bookmarks.getTree((rootNodes) => {
      const root = rootNodes[0];
      if (!root?.children) {
        resolve();
        return;
      }

      const bookmarksBar = root.children.find(
        (node) => node.id === '1' || node.title.toLowerCase().includes('bar'),
      );
      const otherNodes = root.children.filter(
        (node) => node.id !== bookmarksBar?.id && !node.title.toLowerCase().includes('extensions'),
      );

      state.allBookmarks = root.children;

      const displayList = [];
      if (!state.hideBookmarksBar && bookmarksBar?.children) {
        displayList.push(...bookmarksBar.children);
      }
      displayList.push(...otherNodes);

      renderGrid(displayList, DOM.grid, openFolder);
      resolve();
    });
  });
}

function setupUserInterfaceListeners() {
  DOM.closeModalBtn.addEventListener('click', closeModal);
  DOM.modalBackdrop.addEventListener('click', closeModal);
  DOM.addFolderBtn.addEventListener('click', createNewFolder);
  DOM.bgBtn.addEventListener('click', () => DOM.bgInput.click());
  DOM.bgInput.addEventListener('change', (e) => handleImageUpload(e, updateDashboardBackground));

  // Search Engine Listeners
  DOM.currentEngineBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.engineDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    DOM.engineDropdown.classList.add('hidden');
  });

  // Settings Listeners
  DOM.settingsBtn.addEventListener('click', openSettings);
  DOM.closeSettingsBtn.addEventListener('click', closeSettings);
  DOM.settingsBackdrop.addEventListener('click', closeSettings);
  
  DOM.blurSlider.addEventListener('input', (e) => {
    const blurValue = e.target.value;
    document.documentElement.style.setProperty('--bg-blur', `${blurValue}px`);
  });
  
  DOM.blurSlider.addEventListener('change', (e) => {
    if (chrome.storage) {
      chrome.storage.local.set({ backdropBlur: e.target.value });
    }
  });

  DOM.userNameInput.addEventListener('input', (e) => {
    if (chrome.storage) {
      chrome.storage.local.set({ userName: e.target.value.trim() });
    }
  });

  DOM.motionToggle.addEventListener('change', (e) => {
    const reduced = e.target.checked;
    document.body.classList.toggle('no-animations', reduced);
    if (chrome.storage) {
      chrome.storage.local.set({ reduceMotion: reduced });
    }
  });

  DOM.hideBookmarksBarToggle.addEventListener('change', (e) => {
    state.hideBookmarksBar = e.target.checked;
    if (chrome.storage) {
      chrome.storage.local.set({ hideBookmarksBar: state.hideBookmarksBar });
    }
    refreshBookmarksView();
  });

  DOM.exportSettingsBtn.addEventListener('click', exportSettings);
  DOM.importSettingsBtn.addEventListener('click', () => DOM.importSettingsInput.click());
  DOM.importSettingsInput.addEventListener('change', (e) => 
    importSettings(e, () => loadSettings(updateDashboardBackground, setSearchEngine), closeSettings)
  );
  DOM.resetBgBtn.addEventListener('click', () => resetBackground(updateDashboardBackground));

  // Optimized: Debounced Search (200ms delay)
  const debouncedSearch = debounce((query) => {
    state.selectedIndex = -1;
    if (query.length > 0) {
      const results = searchRecursive(state.allBookmarks, query);
      renderGrid(results, DOM.grid, openFolder, query);
    } else {
      refreshBookmarksView();
    }
  }, 200);

  DOM.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.startsWith('!')) {
      const match = query.match(/^!([a-z]+)\s/);
      if (match) {
        const prefix = match[1];
        const engineKeys = Object.keys(SEARCH_ENGINES);
        const targetKey = engineKeys.find(key => key.startsWith(prefix));
        if (targetKey) {
          setSearchEngine(targetKey);
          DOM.searchInput.value = query.replace(/^![a-z]+\s/, '');
          return;
        }
      }
    }
    
    debouncedSearch(query);
  });

  DOM.searchInput.addEventListener('keydown', (e) => {
    const items = DOM.grid.querySelectorAll('.grid-item');

    if (e.key === 'Escape') {
      if (DOM.searchInput.value) {
        DOM.searchInput.value = '';
        state.selectedIndex = -1;
        refreshBookmarksView();
      } else {
        DOM.searchInput.blur();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      cycleSearchEngine();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        state.selectedIndex = Math.min(state.selectedIndex + 1, items.length - 1);
        updateSelection(items);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        state.selectedIndex = Math.max(state.selectedIndex - 1, -1);
        updateSelection(items);
      }
    } else if (e.key === 'Enter') {
      const query = DOM.searchInput.value.trim();
      
      if (state.selectedIndex >= 0 && items[state.selectedIndex]) {
        items[state.selectedIndex].click();
      } else if (query) {
        const engine = SEARCH_ENGINES[state.currentEngine];
        const searchUrl = engine.url + encodeURIComponent(query);
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          chrome.tabs.update({ url: searchUrl });
        } else {
          window.location.href = searchUrl;
        }
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== DOM.searchInput) {
      e.preventDefault();
      DOM.searchInput.focus();
    }
  });
}

function updateSelection(items) {
  items.forEach((item, index) => {
    if (index === state.selectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      item.classList.remove('selected');
    }
  });
}

function setSearchEngine(key) {
  if (!SEARCH_ENGINES[key]) return;
  state.currentEngine = key;
  DOM.currentEngineIcon.innerHTML = SEARCH_ENGINES[key].icon;
  renderEngineDropdown();
  
  if (chrome.storage) {
    chrome.storage.local.set({ preferredEngine: key });
  }
}

function cycleSearchEngine() {
  const keys = Object.keys(SEARCH_ENGINES);
  const currentIndex = keys.indexOf(state.currentEngine);
  const nextIndex = (currentIndex + 1) % keys.length;
  setSearchEngine(keys[nextIndex]);
}

function renderEngineDropdown() {
  DOM.engineDropdown.innerHTML = '';
  Object.keys(SEARCH_ENGINES).forEach(key => {
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

function openFolder(folder) {
  state.currentParentId = folder.id;
  state.currentModalFolderId = folder.id;

  DOM.modalTitle.textContent = folder.title;
  renderGrid(folder.children || [], DOM.modalGrid, openFolder);

  DOM.modal.classList.remove('hidden');
  DOM.modal.removeAttribute('inert');
  DOM.closeModalBtn.focus();
}

function closeModal() {
  DOM.searchInput.focus();
  DOM.modal.classList.add('hidden');
  DOM.modal.setAttribute('inert', '');
  state.currentParentId = '1';
  state.currentModalFolderId = null;
}

function openSettings() {
  DOM.settingsModal.classList.remove('hidden');
  DOM.settingsModal.removeAttribute('inert');
  DOM.closeSettingsBtn.focus();
}

function closeSettings() {
  DOM.settingsModal.classList.add('hidden');
  DOM.settingsModal.setAttribute('inert', '');
  DOM.searchInput.focus();
}

function createNewFolder() {
  const name = prompt('Folder name:');
  if (name?.trim()) {
    chrome.bookmarks.create({ parentId: state.currentParentId, title: name.trim() });
  }
}

function setupBookmarksListeners() {
  if (!chrome.bookmarks) return;

  const uiRefresher = () => {
    if (DOM.searchInput.value.trim()) return;
    refreshBookmarksView();

    if (state.currentModalFolderId) {
      chrome.bookmarks.getSubTree(state.currentModalFolderId, ([node]) => {
        if (node) openFolder(node);
        else closeModal();
      });
    }
  };

  chrome.bookmarks.onCreated.addListener(uiRefresher);
  chrome.bookmarks.onRemoved.addListener(uiRefresher);
  chrome.bookmarks.onChanged.addListener(uiRefresher);
  chrome.bookmarks.onMoved.addListener(uiRefresher);
}
