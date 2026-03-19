/**
 * @fileoverview UI rendering logic for the Mosaic Home dashboard.
 */

import { DEFAULT_SVG } from './constants.js';
import { getIconUrl, openInternalUrl } from './utils.js';
import { setupDraggable, setupDroppableFolder } from './dragDrop.js';

/**
 * Global observer for lazy loading icons. In test or non-browser
 * environments `IntersectionObserver` may be undefined, so we guard
 * and provide a no-op fallback.
 */
let iconObserver;
if (typeof IntersectionObserver !== 'undefined') {
  iconObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    { rootMargin: '50px' },
  );
} else {
  iconObserver = {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
}

/**
 * Renders a grid of bookmarks and folders into a container.
 */
export function renderGrid(data, container, onFolderClick) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const fragment = document.createDocumentFragment();

  data.forEach((item) => {
    if (item.title === 'Extensions' && !item.url) return;

    const element =
      item.children || !item.url
        ? createFolderElement(item, onFolderClick)
        : createBookmarkElement(item);

    if (element) fragment.appendChild(element);
  });

  container.appendChild(fragment);
}

function createFolderElement(folderData, onClick) {
  const div = document.createElement('div');
  div.className = 'grid-item folder-item';
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', `Folder: ${folderData.title}`);
  div.setAttribute('tabindex', '0');

  setupDraggable(div, folderData);
  setupDroppableFolder(div, folderData);

  div.innerHTML = `
        <div class="icon-container folder-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/></svg>
        </div>
        <span class="item-label"></span>
    `;
  div.querySelector('.item-label').textContent = folderData.title || 'Untitled Folder';

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

function createBookmarkElement(bookmarkData) {
  const a = document.createElement('a');
  a.className = 'grid-item bookmark-item';
  a.setAttribute('role', 'link');
  a.setAttribute('aria-label', `Bookmark: ${bookmarkData.title}`);

  let isRestricted = false;
  try {
    const url = new URL(bookmarkData.url);
    const proto = url.protocol.toLowerCase();
    isRestricted = ['chrome:', 'chrome-extension:', 'file:', 'about:'].includes(proto);
  } catch (e) {
    // Ignore invalid URL
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
  img.alt = '';
  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent pixel
  img.dataset.src = getIconUrl(bookmarkData.url, '32');
  img.onerror = () => {
    img.src = DEFAULT_SVG;
  };

  // Register for lazy loading
  iconObserver.observe(img);

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
