/**
 * @fileoverview Modal and settings navigation for Mosaic Home.
 */

import { state } from './state.js';
import { DOM } from './dom.js';

/**
 * Opens a bookmark folder in the modal view.
 * @param {Object} folder - The bookmark folder object.
 * @param {Function} renderGrid - The grid rendering function.
 */
export function openFolder(folder, renderGrid) {
  state.currentParentId = folder.id;
  state.currentModalFolderId = folder.id;

  DOM.modalTitle.textContent = folder.title;
  renderGrid(folder.children || [], DOM.modalGrid, (f) => openFolder(f, renderGrid));

  DOM.modal.classList.remove('hidden');
  DOM.modal.removeAttribute('inert');
  DOM.closeModalBtn.focus();
}

/**
 * Closes the folder modal.
 */
export function closeModal() {
  DOM.searchInput.focus();
  DOM.modal.classList.add('hidden');
  DOM.modal.setAttribute('inert', '');
  state.currentParentId = '1';
  state.currentModalFolderId = null;
}

/**
 * Opens the settings modal.
 */
export function openSettings() {
  DOM.settingsModal.classList.remove('hidden');
  DOM.settingsModal.removeAttribute('inert');
  DOM.closeSettingsBtn.focus();
}

/**
 * Closes the settings modal.
 */
export function closeSettings() {
  DOM.settingsModal.classList.add('hidden');
  DOM.settingsModal.setAttribute('inert', '');
  DOM.searchInput.focus();
}
