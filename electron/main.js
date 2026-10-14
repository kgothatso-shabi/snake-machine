// Electron main process: opens the built game (dist/index.html) in a window.
// Plain CommonJS on purpose, so it needs no build step.
const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

// Set SNAKE_DEV_URL (see `npm run desktop:dev`) to load the Vite dev server.
const DEV_URL = process.env.SNAKE_DEV_URL

/** @type {BrowserWindow | null} */
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 760,
    height: 920,
    minWidth: 360,
    minHeight: 560,
    title: 'Snake II',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    // Packaged builds take the icon from the .exe itself.
    icon: app.isPackaged
      ? undefined
      : path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (DEV_URL) {
    mainWindow.loadURL(DEV_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // The game never opens links, but if it ever does, use the real browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // F11 toggles full screen.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen())
      event.preventDefault()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Only one game window at a time.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null)
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    app.quit()
  })
}
