/**
 * @fileoverview Context Menu Logic for Bookmarks and Folders
 */

let contextMenu = null;

export function initContextMenu() {
  if (contextMenu) return;

  contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu hidden';
  document.body.appendChild(contextMenu);

  document.addEventListener('click', () => {
    if (!contextMenu.classList.contains('hidden')) {
      hideContextMenu();
    }
  });

  document.addEventListener('contextmenu', (e) => {
    // If we click anywhere else, hide the custom menu
    if (!e.target.closest('.grid-item')) {
      hideContextMenu();
    }
  });
}

function hideContextMenu() {
  if (contextMenu) {
    contextMenu.classList.add('hidden');
    contextMenu.innerHTML = '';
  }
}

export function showContextMenu(e, itemData) {
  e.preventDefault();
  
  if (!contextMenu) initContextMenu();

  contextMenu.innerHTML = '';
  contextMenu.classList.remove('hidden');

  const isFolder = !itemData.url;

  const actions = [];

  if (!isFolder) {
    actions.push(
      {
        label: 'Open in New Tab',
        action: () => chrome.tabs.create({ url: itemData.url, active: false }),
      },
      {
        label: 'Open in Incognito',
        action: () => chrome.windows.create({ url: itemData.url, incognito: true }),
      },
      { type: 'divider' }
    );
  }

  actions.push(
    {
      label: 'Edit Title',
      action: () => {
        const newTitle = prompt('Enter new title:', itemData.title);
        if (newTitle !== null && newTitle.trim() !== '') {
          chrome.bookmarks.update(itemData.id, { title: newTitle.trim() });
        }
      },
    }
  );

  if (!isFolder) {
    actions.push({
      label: 'Edit URL',
      action: () => {
        const newUrl = prompt('Enter new URL:', itemData.url);
        if (newUrl !== null && newUrl.trim() !== '') {
          chrome.bookmarks.update(itemData.id, { url: newUrl.trim() });
        }
      },
    });
  }

  actions.push(
    { type: 'divider' },
    {
      label: 'Delete',
      danger: true,
      action: () => {
        if (isFolder) {
          if (confirm(`Are you sure you want to delete the folder "${itemData.title}" and all its contents?`)) {
            chrome.bookmarks.removeTree(itemData.id);
          }
        } else {
          chrome.bookmarks.remove(itemData.id);
        }
      },
    }
  );

  actions.forEach((item) => {
    if (item.type === 'divider') {
      const divider = document.createElement('div');
      divider.className = 'context-menu-divider';
      contextMenu.appendChild(divider);
    } else {
      const btn = document.createElement('button');
      btn.className = `context-menu-item ${item.danger ? 'danger' : ''}`;
      btn.textContent = item.label;
      btn.onclick = (event) => {
        event.stopPropagation();
        item.action();
        hideContextMenu();
      };
      contextMenu.appendChild(btn);
    }
  });

  // Calculate position to prevent overflowing off-screen
  const menuRect = contextMenu.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let x = e.clientX;
  let y = e.clientY;

  if (x + menuRect.width > windowWidth) {
    x = windowWidth - menuRect.width - 8;
  }
  if (y + menuRect.height > windowHeight) {
    y = windowHeight - menuRect.height - 8;
  }

  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
}