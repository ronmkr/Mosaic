/**
 * @fileoverview Mosaic Home - Main Application Controller
 */

import { renderGrid } from './ui.js';
import { initClock } from './widgets.js';
import { debounce, compressImage } from './utils.js';
import { initContextMenu } from './contextMenu.js';
import { SEARCH_ENGINES } from './searchEngines.js';

const state = {
  currentParentId: '1',
  currentModalFolderId: null,
  allBookmarks: [],
  currentEngine: 'google',
  selectedIndex: -1,
};

const DOM = {
  grid: document.getElementById('grid'),
  modal: document.getElementById('folder-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalGrid: document.getElementById('modal-grid'),
  searchInput: document.getElementById('search-input'),
  bgInput: document.getElementById('bg-input'),
  closeModalBtn: document.getElementById('close-modal'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  addFolderBtn: document.getElementById('add-folder-btn'),
  bgBtn: document.getElementById('bg-btn'),
  bgOverlay: document.getElementById('bg-overlay'),
  
  settingsBtn: document.getElementById('settings-btn'),
  settingsModal: document.getElementById('settings-modal'),
  closeSettingsBtn: document.getElementById('close-settings'),
  settingsBackdrop: document.getElementById('settings-backdrop'),
  blurSlider: document.getElementById('blur-slider'),
  resetBgBtn: document.getElementById('reset-bg-btn'),
  userNameInput: document.getElementById('username-input'),
  motionToggle: document.getElementById('reduce-motion-toggle'),
  
  engineSelector: document.getElementById('engine-selector'),
  currentEngineBtn: document.getElementById('current-engine-btn'),
  currentEngineIcon: document.getElementById('current-engine-icon'),
  engineDropdown: document.getElementById('engine-dropdown'),
  
  exportSettingsBtn: document.getElementById('export-settings-btn'),
  importSettingsBtn: document.getElementById('import-settings-btn'),
  importSettingsInput: document.getElementById('import-settings-input'),
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  initClock();
  initContextMenu();
  setupBookmarksListeners();
  setupUserInterfaceListeners();

  setSearchEngine(state.currentEngine); // Set default icon
  renderEngineDropdown();

  await Promise.all([loadCustomBackground(), refreshBookmarksView()]);
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
      if (bookmarksBar?.children) displayList.push(...bookmarksBar.children);
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
  DOM.bgInput.addEventListener('change', handleImageUpload);

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

  DOM.exportSettingsBtn.addEventListener('click', exportSettings);
  DOM.importSettingsBtn.addEventListener('click', () => DOM.importSettingsInput.click());
  DOM.importSettingsInput.addEventListener('change', importSettings);
  DOM.resetBgBtn.addEventListener('click', resetBackground);

  // Optimized: Debounced Search (200ms delay)
  const debouncedSearch = debounce((query) => {
    state.selectedIndex = -1; // Reset selection on new search
    if (query.length > 0) {
      const results = searchRecursive(state.allBookmarks, query);
      renderGrid(results, DOM.grid, openFolder, query);
    } else {
      refreshBookmarksView();
    }
  }, 200);

  DOM.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Quick engine switch via prefix (e.g., "!g ")
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
        // Open selected bookmark
        items[state.selectedIndex].click();
      } else if (query) {
        // Perform web search
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

async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Use a higher limit for source, compression will handle it
  if (file.size > 10 * 1024 * 1024) {
    alert('Please choose an image smaller than 10MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const rawBase64 = event.target.result;
    try {
      // Compress image to 1080p equivalent at 70% quality
      const compressedBase64 = await compressImage(rawBase64, 1920, 0.7);
      updateDashboardBackground(compressedBase64);
      chrome.storage.local.set({ backgroundImage: compressedBase64 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Compression failed', err);
      updateDashboardBackground(rawBase64);
      chrome.storage.local.set({ backgroundImage: rawBase64 });
    }
  };
  reader.readAsDataURL(file);
}

function openFolder(folder) {
  state.currentParentId = folder.id;
  state.currentModalFolderId = folder.id;

  DOM.modalTitle.textContent = folder.title;
  renderGrid(folder.children || [], DOM.modalGrid, openFolder);

  DOM.modal.classList.remove('hidden');
  DOM.modal.removeAttribute('inert');

  // Accessibility: Move focus to the modal title or first focusable element
  DOM.closeModalBtn.focus();
}

function closeModal() {
  // Accessibility: Move focus back to the search input or main grid before hiding
  DOM.searchInput.focus();

  DOM.modal.classList.add('hidden');
  DOM.modal.setAttribute('inert', ''); // Prevents focus/interaction while hidden

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

async function resetBackground() {
  if (confirm('Are you sure you want to reset the background image?')) {
    if (chrome.storage) {
      await new Promise((resolve) => {
        chrome.storage.local.remove('backgroundImage', resolve);
      });
      updateDashboardBackground('');
    }
  }
}

async function loadCustomBackground() {
  if (!chrome.storage) return;
  return new Promise((resolve) => {
    chrome.storage.local.get(['backgroundImage', 'backdropBlur', 'userName', 'reduceMotion', 'preferredEngine'], (result) => {
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
      resolve();
    });
  });
}

function updateDashboardBackground(url) {
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

export function searchRecursive(nodes, query) {
  const lowerQuery = query.toLowerCase();
  let matches = [];

  nodes.forEach((node) => {
    if (node.title.toLowerCase().includes(lowerQuery)) {
      matches.push(node);
    }
    if (node.children) {
      matches = [...matches, ...searchRecursive(node.children, lowerQuery)];
    }
  });

  return matches.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
}

function exportSettings() {
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

function importSettings(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const items = JSON.parse(event.target.result);
      if (chrome.storage && typeof items === 'object') {
        chrome.storage.local.set(items, () => {
          alert('Settings imported successfully!');
          loadCustomBackground(); // Refresh visually
          closeSettings();
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
