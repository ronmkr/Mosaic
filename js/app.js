import { renderGrid } from './ui.js';
import { initClock } from './widgets.js';

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('grid');
    const modal = document.getElementById('folder-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalGrid = document.getElementById('modal-grid');
    const addFolderBtn = document.getElementById('add-folder-btn');
    const bgBtn = document.getElementById('bg-btn');
    const bgInput = document.getElementById('bg-input');

    let currentParentId = "1"; 
    let currentModalFolderId = null;

    // Initialize widgets
    initClock();

    // Load Background
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['backgroundImage'], (result) => {
            if (result.backgroundImage) {
                applyBackground(result.backgroundImage);
            }
        });
    }

    loadBookmarks();

    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.onCreated.addListener(refreshView);
        chrome.bookmarks.onRemoved.addListener(refreshView);
        chrome.bookmarks.onChanged.addListener(refreshView);
        chrome.bookmarks.onMoved.addListener(refreshView);
    }

    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    addFolderBtn.addEventListener('click', () => {
        const title = prompt("Enter new folder name:");
        if (title && title.trim().length > 0) {
            if (typeof chrome !== 'undefined' && chrome.bookmarks) {
                chrome.bookmarks.create({
                    parentId: currentParentId,
                    title: title.trim()
                });
            }
        }
    });

    // Background Change Logic
    bgBtn.addEventListener('click', () => bgInput.click());

    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target.result;
            applyBackground(base64Image);
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ backgroundImage: base64Image });
            }
        };
        reader.readAsDataURL(file);
    });

    function applyBackground(dataUrl) {
        document.body.style.backgroundImage = `url(${dataUrl})`;
        document.body.classList.add('has-bg');
    }

    function refreshView() {
        loadBookmarks();
        if (currentModalFolderId) {
            chrome.bookmarks.getSubTree(currentModalFolderId, (results) => {
                if (results && results.length > 0) {
                    renderModal(results[0]);
                } else {
                    closeModal();
                }
            });
        }
    }

    function loadBookmarks() {
        if (typeof chrome !== 'undefined' && chrome.bookmarks) {
            chrome.bookmarks.getTree((bookmarkTreeNodes) => {
                if (bookmarkTreeNodes.length > 0 && bookmarkTreeNodes[0].children) {
                    const rootChildren = bookmarkTreeNodes[0].children;
                    const itemsToRender = [];
                    
                    rootChildren.forEach(node => {
                        if (node.title === "Extensions") return;

                        if (node.id === "1" || node.title === "Bookmarks bar") {
                            currentParentId = node.id; 
                            if (node.children) {
                                itemsToRender.push(...node.children);
                            }
                        } else {
                            if (node.children && node.children.length > 0) {
                                itemsToRender.push(node);
                            }
                        }
                    });
                    
                    renderGrid(itemsToRender, grid, openFolder);
                }
            });
        } else {
            grid.innerHTML = '<p>Chrome bookmarks API not available.</p>';
        }
    }

    function openFolder(folderData) {
        currentParentId = folderData.id;
        currentModalFolderId = folderData.id;
        
        renderModal(folderData);
        modal.classList.remove('hidden');
    }

    function renderModal(folderData) {
        modalTitle.textContent = folderData.title;
        const validChildren = folderData.children ? folderData.children.filter(item => !(item.title === 'Extensions' && !item.url)) : [];
        renderGrid(validChildren, modalGrid, openFolder);
    }

    function closeModal() {
        modal.classList.add('hidden');
        currentParentId = "1";
        currentModalFolderId = null;
    }
});
