import 'jest-environment-jsdom';

// simple no-op function
const noop = () => {};

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock chrome API
global.chrome = {
  runtime: {
    id: 'test-extension-id',
  },
  bookmarks: {
    getTree: noop,
    create: noop,
    move: noop,
    remove: noop,
    onChanged: {
      addListener: noop,
    },
  },
  storage: {
    local: {
      get: noop,
      set: noop,
    },
  },
  tabs: {
    create: noop,
  },
};
