export function setupDraggable(el, itemData) {
    el.setAttribute('draggable', 'true');
    
    el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', itemData.id);
        e.dataTransfer.effectAllowed = 'move';
        // Slight delay prevents the element from disappearing instantly
        setTimeout(() => el.classList.add('dragging'), 0);
    });

    el.addEventListener('dragend', (e) => {
        el.classList.remove('dragging');
    });
}

export function setupDroppableFolder(el, folderData) {
    el.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('drag-over');
    });

    el.addEventListener('dragleave', (e) => {
        el.classList.remove('drag-over');
    });

    el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        
        const draggedId = e.dataTransfer.getData('text/plain');
        
        // Prevent dragging a folder into itself
        if (draggedId && draggedId !== folderData.id) {
            if (typeof chrome !== 'undefined' && chrome.bookmarks) {
                chrome.bookmarks.move(draggedId, { parentId: folderData.id });
            }
        }
    });
}
