/**
 * @fileoverview Recursive search logic for bookmarks.
 */

/**
 * Recursively searches through bookmark nodes for a query string.
 * @param {Array} nodes
 * @param {string} query
 * @returns {Array} Matches
 */
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

  // Deduplicate by ID
  return matches.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
}
