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
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select the project directory.

## 📦 Building for Production

While this is a Vanilla JS project, packaging it correctly for the Chrome Web Store is essential.

### Manual Build
To create a production zip file manually:
```bash
# Exclude development and git files
zip -r mosaic-home.zip . -x "*.git*" ".github*" ".gitignore" "*.md" "LICENSE"
```

### Automated CI/CD (GitHub Actions)
This project includes a GitHub Action pipeline (`.github/workflows/build.yml`):
- **On Push/PR:** Automatically builds and validates the project structure.
- **Artifacts:** Every build generates a `mosaic-home-extension` zip available in the "Actions" tab.
- **Releases:** When you push a tag (e.g., `v1.1.0`), GitHub will automatically create a new Release and attach the production zip.

## ⚙️ Project Structure

- `manifest.json`: Extension configuration and permissions.
- `index.html`: The core dashboard layout.
- `css/styles.css`: Material Design system and theme support.
- `js/`: Modularized application logic.
  - `app.js`: Main entry point and state management.
  - `ui.js`: DOM rendering and component creation.
  - `dragDrop.js`: Drag-and-drop event handlers.
  - `widgets.js`: Clock and utility features.
- `icons/`: Extension branding assets.

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch.
3. Submit a PR!

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.
