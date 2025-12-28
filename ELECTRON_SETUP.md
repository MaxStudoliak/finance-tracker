# 💻 Electron Setup для Desktop приложения

## Что это дает?
- ✅ Нативное приложение для Windows, macOS, Linux
- ✅ Установщики (.exe, .dmg, .deb)
- ✅ Работает оффлайн (с локальной БД)
- ✅ Доступ к файловой системе
- ✅ Автообновления

## Шаг 1: Установка Electron

```bash
cd frontend
npm install electron electron-builder electron-is-dev --save-dev
```

## Шаг 2: Создать electron/main.js

Создайте файл `frontend/electron/main.js`:

```javascript
const { app, BrowserWindow } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    titleBarStyle: 'hiddenInset', // для macOS
    icon: path.join(__dirname, '../public/icon.png'),
  })

  // Development - загрузить Vite dev server
  // Production - загрузить собранные файлы
  win.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  )

  // Открыть DevTools в development
  if (isDev) {
    win.webContents.openDevTools()
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

## Шаг 3: Обновить package.json

```json
{
  "name": "finance-tracker",
  "version": "1.0.0",
  "main": "electron/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "build": {
    "appId": "com.financetracker.app",
    "productName": "Finance Tracker",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.finance",
      "icon": "build/icon.icns",
      "target": ["dmg", "zip"],
      "hardenedRuntime": true,
      "gatekeeperAssess": false
    },
    "win": {
      "icon": "build/icon.ico",
      "target": ["nsis", "portable"]
    },
    "linux": {
      "icon": "build/icon.png",
      "target": ["AppImage", "deb"],
      "category": "Finance"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

## Шаг 4: Установить дополнительные пакеты

```bash
npm install concurrently wait-on --save-dev
```

## Шаг 5: Подготовить иконки

Создайте директорию `frontend/build/` и добавьте:

- **macOS**: `icon.icns` (1024x1024)
- **Windows**: `icon.ico` (256x256)
- **Linux**: `icon.png` (512x512)

Можно использовать онлайн сервисы:
- https://cloudconvert.com/png-to-icns
- https://cloudconvert.com/png-to-ico

## Шаг 6: Обновить vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Важно для Electron!
  build: {
    outDir: 'dist',
  },
})
```

## Шаг 7: Запуск и сборка

### Development (одновременно Vite + Electron):
```bash
npm run electron:dev
```

### Production build:

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux

# Все платформы
npm run electron:build
```

Результат в папке `dist-electron/`:
- **macOS**: `.dmg` установщик
- **Windows**: `.exe` установщик
- **Linux**: `.AppImage` и `.deb`

## Шаг 8: Интеграция с Backend

### Вариант 1: Запуск локального backend внутри Electron

Создайте `electron/backend.js`:

```javascript
const { spawn } = require('child_process')
const path = require('path')

let backendProcess = null

function startBackend() {
  const backendPath = path.join(__dirname, '../../backend')
  
  backendProcess = spawn('node', ['server.js'], {
    cwd: backendPath,
    env: { ...process.env, PORT: 3001 }
  })

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`)
  })

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`)
  })
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill()
  }
}

module.exports = { startBackend, stopBackend }
```

Обновите `electron/main.js`:

```javascript
const { startBackend, stopBackend } = require('./backend')

app.whenReady().then(() => {
  startBackend() // Запустить backend
  createWindow()
})

app.on('before-quit', () => {
  stopBackend() // Остановить backend
})
```

### Вариант 2: Использовать удаленный API

Просто укажите production API URL в `.env`:

```bash
VITE_API_URL=https://your-backend.com/api
```

## Шаг 9: Автообновления (опционально)

```bash
npm install electron-updater
```

```javascript
// electron/main.js
const { autoUpdater } = require('electron-updater')

app.whenReady().then(() => {
  createWindow()
  
  // Проверить обновления
  autoUpdater.checkForUpdatesAndNotify()
})

autoUpdater.on('update-available', () => {
  console.log('Update available')
})

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})
```

## Публикация

### macOS App Store:
1. Apple Developer Account ($99/год)
2. Создать App ID
3. Code signing с сертификатом
4. `electron-builder --mac --publish always`

### Microsoft Store:
1. Microsoft Developer Account ($19 единоразово)
2. Создать app listing
3. `electron-builder --win --publish always`

### Прямое распространение:
Просто загрузите `.dmg`, `.exe`, `.AppImage` на свой сайт/GitHub Releases

## Альтернатива: Tauri (легче Electron)

Если хотите меньший размер приложения (Tauri использует системный WebView вместо встроенного Chromium):

```bash
npm install @tauri-apps/cli @tauri-apps/api
npm install -D @tauri-apps/cli
```

Tauri создает приложения размером ~3-10 MB вместо ~100-200 MB у Electron.

## Сравнение размеров:

- **Web app**: 0 MB (пользователь открывает в браузере)
- **Electron**: ~120 MB (включает Chromium + Node.js)
- **Tauri**: ~5 MB (использует системный браузер)
- **Capacitor**: только мобильные платформы

## Рекомендация:

1. **Начните с web деплоя** (Vercel + Railway) - быстро и бесплатно
2. **Потом добавьте Electron** - если нужны нативные функции
3. **Или используйте PWA** - устанавливается как desktop app, но легче

