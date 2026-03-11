/**
 * @fileoverview Mosaic Home - Main Application Controller
 * Manages core lifecycle, search indexing, and background persistence.
 */

import { renderGrid } from './ui.js';
import { initClock } from './widgets.js';

/**
 * Global App State
 */
const state = {
    currentParentId: "1",      // Default: Bookmarks Bar
    currentModalFolderId: null, // Tracks open folder in modal
    allBookmarks: []           // Flat cache for lightning-fast global search
};

/**
 * UI References
 */
const DOM = {
    grid: document.getElementById('grid'),
    modal: document.getElementById('folder-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalGrid: document.getElementById('modal-grid'),
    searchInput: document.getElementById('search-input'),
    bgInput: document.getElementById('bg-input'),
    // Buttons
    closeModalBtn: document.getElementById('close-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    addFolderBtn: document.getElementById('add-folder-btn'),
    bgBtn: document.getElementById('bg-btn')
};

document.addEventListener('DOMContentLoaded', async () => {
    initApp();
});

/**
 * --- CORE LIFECYCLE ---
 */

async function initApp() {
    initClock();
    setupBookmarksListeners();
    setupUserInterfaceListeners();
    
    await Promise.all([
        loadCustomBackground(),
        refreshBookmarksView()
    ]);
}

/**
 * Fetches and processes the bookmark tree for display.
 */
async function refreshBookmarksView() {
    if (!chrome.bookmarks) return;

    chrome.bookmarks.getTree((rootNodes) => {
        const root = rootNodes[0];
        if (!root?.children) return;

        // 1. Identify standard Chrome bookmark roots
        const bookmarksBar = root.children.find(node => node.id === "1" || node.title.toLowerCase().includes("bar"));
        const otherNodes = root.children.filter(node => 
            node.id !== bookmarksBar?.id && 
            !node.title.toLowerCase().includes("extensions")
        );

        // 2. Index for global search
        state.allBookmarks = root.children;

        // 3. Prepare display list (Flattened Bar + Other Folder Roots)
        const displayList = [];
        if (bookmarksBar?.children) displayList.push(...bookmarksBar.children);
        displayList.push(...otherNodes);

        renderGrid(displayList, DOM.grid, openFolder);
    });
}

/**
 * --- INTERACTION HANDLERS ---
 */

function setupUserInterfaceListeners() {
    // Modal controls
    DOM.closeModalBtn.addEventListener('click', closeModal);
    DOM.modalBackdrop.addEventListener('click', closeModal);

    // Feature buttons
    DOM.addFolderBtn.addEventListener('click', createNewFolder);
    DOM.bgBtn.addEventListener('click', () => DOM.bgInput.click());
    DOM.bgInput.addEventListener('change', handleImageUpload);
    
    // Search interaction
    DOM.searchInput.addEventListener('input', handleSearchInput);
    
    // Keyboard: Quick-focus search with '/'
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== DOM.searchInput) {
            e.preventDefault();
            DOM.searchInput.focus();
        }
    });
}

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length > 0) {
        const results = searchRecursive(state.allBookmarks, query);
        renderGrid(results, DOM.grid, openFolder);
    } else {
        refreshBookmarksView();
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("Please choose an image smaller than 2MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64String = event.target.result;
        updateDashboardBackground(base64String);
        chrome.storage.local.set({ backgroundImage: base64String });
    };
    reader.readAsDataURL(file);
}

/**
 * --- FOLDER MANAGEMENT ---
 */

function openFolder(folder) {
    state.currentParentId = folder.id;
    state.currentModalFolderId = folder.id;
    
    DOM.modalTitle.textContent = folder.title;
    renderGrid(folder.children || [], DOM.modalGrid, openFolder);
    
    DOM.modal.classList.remove('hidden');
    DOM.modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    DOM.modal.classList.add('hidden');
    DOM.modal.setAttribute('aria-hidden', 'true');
    
    state.currentParentId = "1";
    state.currentModalFolderId = null;
}

function createNewFolder() {
    const name = prompt("Folder name:");
    if (name?.trim()) {
        chrome.bookmarks.create({ 
            parentId: state.currentParentId, 
            title: name.trim() 
        });
    }
}

/**
 * --- UTILITIES & STATE SYNC ---
 */

function setupBookmarksListeners() {
    if (!chrome.bookmarks) return;
    
    const uiRefresher = () => {
        if (DOM.searchInput.value.trim()) return; // Don't interrupt search
        refreshBookmarksView();
        
        // Update modal content if a folder is currently open
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
    chrome.storage.local.get(['backgroundImage'], ({ backgroundImage }) => {
        if (backgroundImage) updateDashboardBackground(backgroundImage);
    });
}

function updateDashboardBackground(url) {
    document.body.style.backgroundImage = `url(${url})`;
    document.body.classList.add('has-bg');
}

export function searchRecursive(nodes, query) {
    const lowerQuery = query.toLowerCase();
    let matches = [];
    
    nodes.forEach(node => {
        if (node.title.toLowerCase().includes(lowerQuery)) {
            matches.push(node);
        }
        if (node.children) {
            matches = [...matches, ...searchRecursive(node.children, lowerQuery)];
        }
    });
    
    // Remove duplicate matches by ID
    return matches.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
    );
}
