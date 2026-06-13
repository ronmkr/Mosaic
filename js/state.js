/**
 * @fileoverview Application state management for Mosaic Home.
 */

export const state = {
  currentParentId: '1',
  currentModalFolderId: null,
  allBookmarks: [],
  currentEngine: 'google',
  selectedIndex: -1,
  hideBookmarksBar: false,
};

/**
 * Updates a state property and optionally persists it to storage.
 * @param {string} key
 * @param {any} value
 */
export function updateState(key, value) {
  if (key in state) {
    state[key] = value;
  }
}
