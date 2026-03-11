/**
 * @fileoverview UI rendering logic for the Mosaic Home dashboard.
 * Follows Material Design 3 principles and accessibility best practices.
 */

import { DEFAULT_SVG } from './constants.js';
import { getIconUrl, openInternalUrl } from './utils.js';
import { setupDraggable, setupDroppableFolder } from './dragDrop.js';

/**
 * Renders a grid of bookmarks and folders into a container.
 * @param {Array<chrome.bookmarks.BookmarkTreeNode>} data - The bookmark nodes to render.
 * @param {HTMLElement} container - The target DOM element.
 * @param {Function} onFolderClick - Callback for folder interaction.
 */
export function renderGrid(data, container, onFolderClick) {
    // Clear container efficiently
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const fragment = document.createDocumentFragment();
    
    data.forEach(item => {
        // Skip extension-specific folders that shouldn't be managed by users
        if (item.title === 'Extensions' && !item.url) return;

        let element;
        if (item.children || !item.url) {
            element = createFolderElement(item, onFolderClick);
        } else {
            element = createBookmarkElement(item);
        }
        
        if (element) fragment.appendChild(element);
    });

    container.appendChild(fragment);
}

/**
 * Creates a folder element with drag-and-drop support.
 * @param {chrome.bookmarks.BookmarkTreeNode} folderData
 * @param {Function} onClick
 * @returns {HTMLElement}
 */
function createFolderElement(folderData, onClick) {
    const div = document.createElement('div');
    div.className = 'grid-item folder-item';
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', `Folder: ${folderData.title}`);
    div.setAttribute('tabindex', '0');
    
    setupDraggable(div, folderData);
    setupDroppableFolder(div, folderData);
    
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container folder-icon';
    iconContainer.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/></svg>`;
    
    const span = document.createElement('span');
    span.textContent = folderData.title || 'Untitled Folder';
    span.className = 'item-label';
    
    div.appendChild(iconContainer);
    div.appendChild(span);
    
    const handleAction = (e) => {
        if (div.classList.contains('dragging')) return;
        onClick(folderData);
    };

    div.addEventListener('click', handleAction);
    div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAction(e);
        }
    });
    
    return div;
}

/**
 * Creates a bookmark element with security-conscious URL handling.
 * @param {chrome.bookmarks.BookmarkTreeNode} bookmarkData
 * @returns {HTMLElement}
 */
function createBookmarkElement(bookmarkData) {
    const a = document.createElement('a');
    a.className = 'grid-item bookmark-item';
    a.setAttribute('role', 'link');
    a.setAttribute('aria-label', `Bookmark: ${bookmarkData.title}`);
    
    // Safety check for restricted protocols
    let isRestricted = false;
    try {
        const url = new URL(bookmarkData.url);
        const proto = url.protocol.toLowerCase();
        isRestricted = ['chrome:', 'chrome-extension:', 'file:', 'about:'].includes(proto);
    } catch (e) {
        // Fallback for invalid URLs
    }

    if (!isRestricted) {
        a.href = bookmarkData.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
    } else {
        a.href = '#';
        a.title = `Internal: ${bookmarkData.url}`;
    }
    
    setupDraggable(a, bookmarkData);
    
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container bookmark-icon';
    
    const img = document.createElement('img');
    img.src = getIconUrl(bookmarkData.url, "32");
    img.alt = ""; // Decorative icon
    img.onerror = () => { img.src = DEFAULT_SVG; };
    
    iconContainer.appendChild(img);
    
    const span = document.createElement('span');
    span.textContent = bookmarkData.title || 'New Bookmark';
    span.className = 'item-label';
    
    a.appendChild(iconContainer);
    a.appendChild(span);

    a.addEventListener('click', (e) => {
        if (a.classList.contains('dragging')) {
            e.preventDefault();
            return;
        }

        if (isRestricted || openInternalUrl(bookmarkData.url)) {
            e.preventDefault();
            if (typeof chrome !== 'undefined' && chrome.tabs) {
                chrome.tabs.create({ url: bookmarkData.url });
            }
        }
    });
    
    return a;
}
