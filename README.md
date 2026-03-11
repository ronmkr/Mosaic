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
2. **Note on Size:** If you have run `npm install`, the `node_modules` folder will make the project directory appear large (~45MB). Chrome will include this entire folder if you load the root directory. To keep the extension lightweight, you can delete `node_modules` after running tests, or simply ignore it as it is not needed for the extension to function.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top right).
5. Click **Load unpacked** and select the project directory.

## 📦 Building for Production

### Manual Build
To create a production zip file manually:
```bash
# Exclude development and git files
zip -r mosaic-home.zip . -x "*.git*" ".github*" ".gitignore" "*.md" "LICENSE"
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

We track planned improvements via [GitHub Issues](https://github.com/ronmkr/chrome_homepage/issues). Major upcoming items include:
- Keyboard Navigation (Arrow keys, `/` for search)
- Custom Right-Click Context Menus
- Device Sync for Settings
- Frequently Visited Sites Section

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch.
3. Submit a PR!

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.
