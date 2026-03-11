/**
 * @jest-environment jsdom
 */

import { renderGrid } from '../js/ui.js';

describe('UI Rendering Tests', () => {
    let container;

    beforeEach(() => {
        // Set up a fresh container for each test
        document.body.innerHTML = '<div id="grid"></div>';
        container = document.getElementById('grid');
        
        // Mock chrome global with plain functions
        global.chrome = {
            runtime: { id: 'test-id' },
            tabs: { create: () => {} }
        };
    });

    test('renderGrid should render folders and bookmarks correctly', () => {
        const mockData = [
            { id: '1', title: 'Folder 1', children: [] },
            { id: '2', title: 'Google', url: 'https://google.com' }
        ];

        renderGrid(mockData, container, () => {});

        const items = container.querySelectorAll('.grid-item');
        expect(items).toHaveLength(2);
        
        expect(items[0].classList.contains('folder-item')).toBe(true);
        expect(items[0].querySelector('.item-label').textContent).toBe('Folder 1');
        
        expect(items[1].classList.contains('bookmark-item')).toBe(true);
        expect(items[1].querySelector('.item-label').textContent).toBe('Google');
    });

    test('should NOT set href for restricted URLs', () => {
        const restrictedData = [
            { id: '3', title: 'Settings', url: 'chrome://settings' }
        ];

        renderGrid(restrictedData, container, () => {});

        const bookmark = container.querySelector('.bookmark-item');
        expect(bookmark.getAttribute('href')).toBe('#');
    });

    test('should skip folders named "Extensions"', () => {
        const dataWithExtensions = [
            { id: '4', title: 'Extensions', children: [] },
            { id: '5', title: 'My Work', children: [] }
        ];

        renderGrid(dataWithExtensions, container, () => {});

        const items = container.querySelectorAll('.folder-item');
        expect(items).toHaveLength(1);
        expect(items[0].querySelector('.item-label').textContent).toBe('My Work');
    });
});
