/**
 * @fileoverview Mosaic Home - Main Application Controller
 */

import { renderGrid } from './ui.js';
import { initClock } from './widgets.js';
import { debounce, compressImage } from './utils.js';
import { initContextMenu } from './contextMenu.js';

const state = {
  currentParentId: '1',
  currentModalFolderId: null,
  allBookmarks: [],
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
  
  settingsBtn: document.getElementById('settings-btn'),
  settingsModal: document.getElementById('settings-modal'),
  closeSettingsBtn: document.getElementById('close-settings'),
  settingsBackdrop: document.getElementById('settings-backdrop'),
  blurSlider: document.getElementById('blur-slider'),
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  initClock();
  initContextMenu();
  setupBookmarksListeners();
  setupUserInterfaceListeners();

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

  // Optimized: Debounced Search (200ms delay)
  const debouncedSearch = debounce((query) => {
    if (query.length > 0) {
      const results = searchRecursive(state.allBookmarks, query);
      renderGrid(results, DOM.grid, openFolder, query);
    } else {
      refreshBookmarksView();
    }
  }, 200);

  DOM.searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value.trim()));

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== DOM.searchInput) {
      e.preventDefault();
      DOM.searchInput.focus();
    }
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

async function loadCustomBackground() {
  if (!chrome.storage) return;
  return new Promise((resolve) => {
    chrome.storage.local.get(['backgroundImage', 'backdropBlur'], (result) => {
      if (result.backgroundImage) updateDashboardBackground(result.backgroundImage);
      if (result.backdropBlur !== undefined) {
        DOM.blurSlider.value = result.backdropBlur;
        document.documentElement.style.setProperty('--bg-blur', `${result.backdropBlur}px`);
      }
      resolve();
    });
  });
}

function updateDashboardBackground(url) {
  document.body.style.backgroundImage = `url(${url})`;
  document.body.classList.add('has-bg');
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
