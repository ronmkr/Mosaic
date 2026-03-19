# Mosaic Home

Mosaic Home is a high-performance, minimalist Chrome extension that transforms your "New Tab" page into a sleek, organized bookmarks dashboard.

![Icon](public/icons/logo.svg)

## 🚀 Features

- **Global Search:** Real-time, deep search across all bookmark folders.
- **Material Grid Layout:** Responsive grid designed with modern Chrome aesthetics.
- **Bookmark Management:** Full drag-and-drop support for moving items into folders.
- **Custom Backgrounds:** Upload personal wallpapers with persistent storage.
- **Focus Clock:** Prominent, centered digital clock and date display.
- **Privacy First:** 100% local processing; uses Chrome's native APIs for all data.

## 🛠️ Installation & Local Development

This project uses **Vite** for fast, modern web development and asset bundling.

### Setting up the Environment

1. Clone or download this repository.
2. Ensure you have Node.js installed.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally (Dev Server)

While you can load the unpacked extension directly from the source code, you can also spin up the Vite development server to quickly iterate on UI components in your browser (note: Chrome Extension native APIs will mock or fail in standard web context without polyfills):
```bash
npm run dev
```

### Loading into Chrome

1. Build the project using `npm run build`. This generates an optimized, minified `dist/` directory.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select the newly created `dist/` directory.

## 📦 Building for Production

To create a production zip file ready for the Chrome Web Store:

```bash
npm run build
```

This command will bundle the extension via Vite, output the compiled assets into `dist/`, and create a `mosaic-home.zip` file containing everything needed.

### Automated CI/CD (GitHub Actions)

Every push to `main` generates a production-ready artifact in the **Actions** tab. Tags (e.g., `v1.1.0`) trigger automated GitHub Releases.

## ⚙️ Project Structure & Coding Standards

This project follows a **Modular ES Module** architecture and strictly enforces coding standards through Husky git hooks:

- **Vite Bundler:** Compiles and maps module dependencies, ensuring compliance with Manifest V3 Content Security Policies.
- **Linting & Formatting:** Enforced via `ESLint` and `Prettier`. Run `npm run lint` or `npm run format` manually if needed.
- **Conventional Commits:** All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, validated locally by `commitlint` before every commit.
- **Stateless Components:** The UI layer focuses on rendering from data passed to it.
- **Native APIs:** Strictly uses Chrome's native APIs (`bookmarks`, `storage`, `tabs`) to ensure stability.

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
3. Make sure your changes pass all checks (`npm run lint` and `npm test`).
4. Commit following the Conventional Commits format.
5. Submit a PR!

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

