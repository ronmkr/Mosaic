# Mosaic Home

Mosaic Home is a high-performance, minimalist Chrome extension that transforms your "New Tab" page into a sleek, organized bookmarks dashboard.

![Icon](icons/logo.svg)

## 🚀 Features

- **Global Search:** Real-time, deep search across all bookmark folders.
- **Material Grid Layout:** Responsive grid designed with modern Chrome aesthetics.
- **Bookmark Management:** Full drag-and-drop support for moving items into folders.
- **Custom Backgrounds:** Upload personal wallpapers with persistent storage.
- **Focus Clock:** Prominent, centered digital clock and date display.
- **Privacy First:** 100% local processing; uses Chrome's native APIs for all data.

## 🛠️ Installation

### Developer / Local Load

1. Clone or download this repository.
2. Chrome will load all files in the directory, including `node_modules`, which can make it appear large (~45 MB). You can safely delete `node_modules` after running tests or use the `npm run build` script to create a zip (see below) if you want a minimal package.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top right).
5. Click **Load unpacked** and select the project directory.

## 📦 Building for Production

### Manual Build

To create a production zip file manually (or use the helper script):

```bash
# using helper script
npm run build

# or manually excluding development and git files
zip -r mosaic-home.zip . -x "*.git*" ".github*" ".gitignore" "*.md" "LICENSE" "CONTRIBUTING.md" "CODE_OF_CONDUCT.md"
```

### Automated CI/CD (GitHub Actions)

Every push to `main` generates a production-ready artifact in the **Actions** tab. Tags (e.g., `v1.1.0`) trigger automated GitHub Releases.

## ⚙️ Project Structure & Coding Standards

This project follows a **Modular ES Module** architecture:

- **Separation of Concerns:** UI rendering, Drag-and-Drop, Widgets, and Utilities are kept in separate files.
- **Stateless Components:** The UI layer focuses on rendering from data passed to it.
- **Native APIs:** Strictly uses Chrome's native APIs (`bookmarks`, `storage`, `tabs`) to ensure stability.
- **Security:** Pre-filters internal protocols (`chrome://`, `file://`) before rendering to prevent CSP/Local Resource errors.

## 🗺️ Roadmap

We track planned improvements via [GitHub Issues](https://github.com/your-repo-owner/mosaic-home/issues). Major upcoming items include:

- **Search Query Highlighting:** Visual markers for matches.
- **Pomodoro Widget:** Built-in productivity timer.
- **Speed-Dial Pins:** Fixed "Quick Access" row for top bookmarks.
- **Settings Backup:** Export/Import configuration as JSON.
- **Keyboard Navigation:** Full arrow key and shortcut support.
- **Bulk Actions:** Multi-select for mass moves or deletes.
- **Custom Sorting:** Sort by name, date, or usage frequency.

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch.
3. Submit a PR!

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.
