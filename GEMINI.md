# Gemini Agent Context & Instructions

This file serves as the definitive reference for how Gemini CLI should interact with and modify the `Mosaic Home` codebase.

## 🏛️ Project Architecture

Mosaic Home is a minimalist Chrome extension "New Tab" override designed for high performance. 

- **Bundler:** Vite
- **Testing:** Jest
- **Linting & Formatting:** ESLint (flat config) and Prettier
- **Git Hooks:** Husky (enforces Conventional Commits and passes linters/tests before commit)
- **Modularity:** Stateless rendering components, separated concerns for drag-and-drop, UI, widgets, and utility functions.
- **APIs:** Strictly Chrome's native Manifest V3 APIs (`chrome.bookmarks`, `chrome.storage`, `chrome.tabs`). Avoid injecting heavy third-party libraries for core logic where native APIs exist.

## 📜 Coding Conventions

1. **Vanilla JavaScript (ES Modules):** Use standard ES6+ syntax. Avoid transpilers like TypeScript unless explicitly mandated by the user.
2. **Stateless UI:** Rendering components should accept data and output DOM/HTML strings or manipulate given elements, relying on a central state management or event-driven system to dictate updates.
3. **Prettier Formatting:** All files must conform to the `.prettierrc` standards. You must run `npm run format` before concluding edits if large blocks were injected manually.
4. **Git Commits:** Always use the `conventional-commits` skill. Commit messages must be structured as `<type>[optional scope]: <description>`.

## 🛠️ Workflows

### Execution Cycle

When taking a directive, follow these steps strictly:
1. **Analyze:** Ensure you know exactly which Chrome API or module handles the request.
2. **Act:** Modify the module or write the new component.
3. **Verify locally:** Run `npm run lint` and `npm test` before committing any changes. Fix any resulting errors.
4. **Commit:** Provide a drafted conventional commit message and ask the user for approval. 

### Adding Features

If implementing a feature from the Roadmap (e.g., Pomodoro Timer, Highlight Matches):
- Try to integrate the feature into the existing UI grid structure or `js/widgets.js`.
- Provide visual implementations utilizing clean, vanilla CSS instead of external frameworks like Tailwind.

## 🛑 Security Constraints
- All external links mapped dynamically must be vetted; never bypass Manifest V3 CSP constraints with arbitrary `eval()` or inline execution.
- Maintain the strict filtering in UI rendering that restricts protocols like `file://` or `chrome://` from attempting to launch improperly mapped URLs.
