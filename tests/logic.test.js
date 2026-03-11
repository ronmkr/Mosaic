/**
 * @jest-environment jsdom
 */

import { searchRecursive } from '../js/app.js';
import { getIconUrl } from '../js/utils.js';
import { DEFAULT_SVG } from '../js/constants.js';

describe('Utility Logic Tests', () => {
    
    test('getIconUrl should return DEFAULT_SVG for restricted protocols', () => {
        const restrictedUrls = [
            'chrome://settings',
            'chrome-extension://abc/index.html',
            'file:///Users/doc.pdf',
            'about:blank'
        ];

        restrictedUrls.forEach(url => {
            expect(getIconUrl(url, 32)).toBe(DEFAULT_SVG);
        });
    });

    test('getIconUrl should return a valid chrome-extension favicon URL for normal sites', () => {
        // Mock chrome.runtime.id for the test environment
        global.chrome = { runtime: { id: 'test-id' } };
        
        const url = 'https://google.com';
        const expected = 'chrome-extension://test-id/_favicon/?pageUrl=https%3A%2F%2Fgoogle.com&size=32';
        
        expect(getIconUrl(url, 32)).toBe(expected);
    });

});

describe('Search Logic Tests', () => {
    const mockData = [
        { id: '1', title: 'Google', url: 'https://google.com' },
        { 
            id: '2', 
            title: 'Development', 
            children: [
                { id: '2-1', title: 'GitHub', url: 'https://github.com' },
                { id: '2-2', title: 'StackOverflow', url: 'https://stackoverflow.com' }
            ]
        },
        { id: '3', title: 'Mail', url: 'https://gmail.com' }
    ];

    test('should find bookmarks at the root level', () => {
        const results = searchRecursive(mockData, 'google');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('1');
    });

    test('should find bookmarks nested in folders', () => {
        const results = searchRecursive(mockData, 'stack');
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('StackOverflow');
    });

    test('should be case-insensitive', () => {
        const results = searchRecursive(mockData, 'GITHUB');
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe('2-1');
    });

    test('should return empty array if no match found', () => {
        const results = searchRecursive(mockData, 'xyz-non-existent');
        expect(results).toHaveLength(0);
    });
});
