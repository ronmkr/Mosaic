# Mosaic Home

Mosaic Home is a high-performance, minimalist Chrome extension that transforms your "New Tab" page into a sleek, organized, and personalized dashboard.

![Mosaic Home Preview](public/screenshot.png)

## Features

- **Personalized Experience:** Dynamic greetings (Morning/Afternoon/Evening) and name personalization.
- **Inspiring Quotes:** A library of 100+ motivational quotes, randomized every time you open a new tab.
- **Super-Contrast UI:** Ultra-bold typography and solid "glass" tiles ensure 100% legibility over any background.
- **Search Engine Selector:** Switch between Google, DuckDuckGo, Bing, GitHub, and YouTube with simple shortcuts (`Tab` or `!g `).
- **Advanced Keyboard Navigation:** Full arrow key and shortcut support (`/` to search, `Esc` to close modals, `Enter` to navigate) for rapid bookmark access.
- **Search Query Highlighting:** Visual markers for matches when searching through your bookmarks.
- **Glassmorphism Design:** Modern, translucent UI components with adjustable backdrop blur.
- **Persistent Favicon Cache:** Bookmarks load instantly and work offline thanks to local icon caching.
- **Custom Backgrounds:** Upload personal wallpapers with a built-in "Reset" feature and "Reduce Motion" mode.
- **Hide Bookmarks Bar:** Option to hide the browser's native bookmarks bar content from the dashboard to prevent duplicate icons.
- **Settings Backup:** Export and import your configuration as a JSON file.
- **Privacy First:** 100% local processing; uses Chrome's native APIs for all data.

## Installation & Local Development

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

## Building for Production

To create a production zip file ready for the Chrome Web Store:

```bash
npm run build
```

This command will bundle the extension via Vite, output the compiled assets into `dist/`, and create a `mosaic-home.zip` file containing everything needed.

## Contributing

1. Fork the repo.
2. Create a feature branch.
3. Make sure your changes pass all checks (`npm run lint` and `npm test`).
4. Commit following the Conventional Commits format.
5. Submit a PR!

## License

MIT License - see the [LICENSE](LICENSE) file for details.
