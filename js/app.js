import { renderGrid } from './ui.js';
import { initClock } from './widgets.js';

document.addEventListener('DOMContentLoaded', () => {
	const grid = document.getElementById('grid');
	const modal = document.getElementById('folder-modal');
	const modalBackdrop = document.getElementById('modal-backdrop');
	const closeModalBtn = document.getElementById('close-modal');
	const modalTitle = document.getElementById('modal-title');
	const modalGrid = document.getElementById('modal-grid');
	const addFolderBtn = document.getElementById('add-folder-btn');
	const bgBtn = document.getElementById('bg-btn');
	const bgInput = document.getElementById('bg-input');
	const searchInput = document.getElementById('search-input');

	let currentParentId = '1';
	let currentModalFolderId = null;
	let bookmarksData = []; // Local cache for searching

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

	// Events
	if (typeof chrome !== 'undefined' && chrome.bookmarks) {
		chrome.bookmarks.onCreated.addListener(refreshView);
		chrome.bookmarks.onRemoved.addListener(refreshView);
		chrome.bookmarks.onChanged.addListener(refreshView);
		chrome.bookmarks.onMoved.addListener(refreshView);
	}

	closeModalBtn.addEventListener('click', closeModal);
	modalBackdrop.addEventListener('click', closeModal);

	addFolderBtn.addEventListener('click', () => {
		const title = prompt('Enter new folder name:');
		if (title && title.trim()) {
			chrome.bookmarks.create({ parentId: currentParentId, title: title.trim() });
		}
	});

	bgBtn.addEventListener('click', () => bgInput.click());
	bgInput.addEventListener('change', (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const b64 = ev.target.result;
			applyBackground(b64);
			chrome.storage.local.set({ backgroundImage: b64 });
		};
		reader.readAsDataURL(file);
	});

	// Search Logic
	searchInput.addEventListener('input', (e) => {
		const query = e.target.value.toLowerCase().trim();
		if (query) {
			// Search globally across the data we have
			const filtered = filterBookmarks(bookmarksData, query);
			renderGrid(filtered, grid, openFolder);
		} else {
			loadBookmarks(); // Reset to normal view
		}
	});

	function filterBookmarks(data, query) {
		let results = [];
		data.forEach((item) => {
			if (item.title.toLowerCase().includes(query)) {
				results.push(item);
			}
			if (item.children) {
				results = results.concat(filterBookmarks(item.children, query));
			}
		});
		// Remove duplicates if any (though usually not an issue in bookmark tree)
		return results.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
	}

	function applyBackground(url) {
		document.body.style.backgroundImage = `url(${url})`;
		document.body.classList.add('has-bg');
	}

	function refreshView() {
		if (searchInput.value.trim()) return; // Don't refresh if user is searching
		loadBookmarks();
		if (currentModalFolderId) {
			chrome.bookmarks.getSubTree(currentModalFolderId, (res) => {
				if (res && res.length) renderModal(res[0]);
				else closeModal();
			});
		}
	}

	function loadBookmarks() {
		if (typeof chrome !== 'undefined' && chrome.bookmarks) {
			chrome.bookmarks.getTree((nodes) => {
				if (nodes.length && nodes[0].children) {
					const bar = nodes[0].children.find(
						(n) => n.id === '1' || n.title.toLowerCase().includes('bar'),
					);
					const other = nodes[0].children.filter(
						(n) => n.id !== bar.id && !n.title.toLowerCase().includes('extensions'),
					);

					bookmarksData = nodes[0].children; // Cache for searching

					const toRender = [];
					if (bar && bar.children) toRender.push(...bar.children);
					toRender.push(...other);

					renderGrid(toRender, grid, openFolder);
				}
			});
		}
	}

	function openFolder(data) {
		currentParentId = data.id;
		currentModalFolderId = data.id;
		renderModal(data);
		modal.classList.remove('hidden');
	}

	function renderModal(data) {
		modalTitle.textContent = data.title;
		renderGrid(data.children || [], modalGrid, openFolder);
	}

	function closeModal() {
		modal.classList.add('hidden');
		currentParentId = '1';
		currentModalFolderId = null;
	}
});
