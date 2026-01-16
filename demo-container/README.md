# Repeatable AI - Demo Container

A customizable app launcher with admin controls for managing navigation links and categories.

## Features

- **Category Management**: Create, edit, and delete categories
- **Link Management**: Add links with "Open in App" or "Open in New Tab" options
- **Admin Mode**: Toggle to enable/disable editing capabilities
- **Light/Dark Mode**: Switch between themes
- **Iframe Support**: Automatic detection of iframe-blocking sites with fallback
- **Responsive Design**: Narrow sidebar maximizes app real estate

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/repeatableai/Demo-Container.git
   cd Demo-Container
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Project Structure

```
Demo-Container/
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Main App Launcher component
│   └── index.css       # Global styles with Tailwind
└── README.md
```

## Usage

### Admin Mode

Click the "Admin" button in the sidebar to enable editing mode. In admin mode you can:

- Add/edit/delete categories
- Add/edit/delete links within categories
- Configure link behavior (open in app vs new tab)
- Mark links as iframe compatible or not

### Adding Links

1. Enable Admin Mode
2. Click "+ Add Link" under any category
3. Enter the link name and URL
4. Choose "In App" or "New Tab" mode
5. Click "Add"

### Iframe Compatibility

Some sites block iframe embedding. The app will:
1. Attempt to load the site in an iframe
2. If blocked, show a fallback screen
3. Automatically mark the link as "Not Iframe Compatible"
4. Future clicks will open directly in a new tab

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

## License

Proprietary - Repeatable AI
