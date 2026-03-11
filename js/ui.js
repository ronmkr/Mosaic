import { DEFAULT_SVG } from './constants.js';
import { getIconUrl, openInternalUrl } from './utils.js';
import { setupDraggable, setupDroppableFolder } from './dragDrop.js';

export function renderGrid(data, container, onFolderClick) {
	container.innerHTML = '';

	data.forEach((item) => {
		if (item.title === 'Extensions' && !item.url) return;

		if (item.children || !item.url) {
			const folderEl = createFolderElement(item, onFolderClick);
			container.appendChild(folderEl);
		} else if (item.url) {
			const bookmarkEl = createBookmarkElement(item);
			container.appendChild(bookmarkEl);
		}
	});
}

function createFolderElement(folderData, onFolderClick) {
	const div = document.createElement('div');
	div.className = 'grid-item folder-item';

	setupDraggable(div, folderData);
	setupDroppableFolder(div, folderData);

	const iconContainer = document.createElement('div');
	iconContainer.className = 'icon-container folder-icon';

	// Standard Material Folder Icon
	iconContainer.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/></svg>`;

	const span = document.createElement('span');
	span.textContent = folderData.title;
	span.className = 'item-label';

	div.appendChild(iconContainer);
	div.appendChild(span);

	div.addEventListener('click', (e) => {
		if (div.classList.contains('dragging')) {
			e.preventDefault();
			return;
		}
		onFolderClick(folderData);
	});

	return div;
}

function createBookmarkElement(bookmarkData) {
	const a = document.createElement('a');
	a.className = 'grid-item bookmark-item';

	// Check if the URL is internal/restricted
	let isRestricted = false;
	try {
		const parsed = new URL(bookmarkData.url);
		const protocol = parsed.protocol.toLowerCase();
		isRestricted =
			protocol === 'chrome:' ||
			protocol === 'chrome-extension:' ||
			protocol === 'file:' ||
			protocol === 'about:';
	} catch (e) {
		// Invalid URL
	}

	// If restricted, don't set href to avoid "Not allowed to load local resource" error.
	// Use a placeholder or just don't set it.
	if (!isRestricted) {
		a.href = bookmarkData.url;
		a.target = '_blank';
	} else {
		a.href = '#'; // Safe placeholder
		a.title = `Open ${bookmarkData.url}`; // Show destination on hover
	}

	setupDraggable(a, bookmarkData);

	const iconContainer = document.createElement('div');
	iconContainer.className = 'icon-container bookmark-icon';

	const img = document.createElement('img');
	img.src = getIconUrl(bookmarkData.url, '32');
	img.onerror = function () {
		this.src = DEFAULT_SVG;
	};

	iconContainer.appendChild(img);

	const span = document.createElement('span');
	span.textContent = bookmarkData.title;
	span.className = 'item-label';

	a.appendChild(iconContainer);
	a.appendChild(span);

	a.addEventListener('click', (e) => {
		if (a.classList.contains('dragging')) {
			e.preventDefault();
			return;
		}

		// If it's a restricted internal URL, we MUST open it via the tabs API.
		if (isRestricted || openInternalUrl(bookmarkData.url)) {
			e.preventDefault();
			if (typeof chrome !== 'undefined' && chrome.tabs) {
				chrome.tabs.create({ url: bookmarkData.url });
			}
		}
	});

	return a;
}
