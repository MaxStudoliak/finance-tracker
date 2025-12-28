# 📱 Capacitor Setup Guide для Finance Tracker

## Шаг 1: Установка Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

## Шаг 2: Инициализация Capacitor

```bash
npx cap init
```

При запросе введите:
- **App name**: Finance Tracker
- **App ID**: com.financetracker.app (можно изменить на свой)
- **Web asset directory**: dist

## Шаг 3: Обновление package.json

Добавьте скрипты сборки:

```json
{
  "scripts": {
    "build": "vite build",
    "cap:ios": "cap add ios && cap sync ios && cap open ios",
    "cap:android": "cap add android && cap sync android && cap open android",
    "cap:sync": "cap sync"
  }
}
```

## Шаг 4: Создание capacitor.config.ts

Создайте файл `frontend/capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financetracker.app',
  appName: 'Finance Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Для разработки можно указать URL бэкенда:
    // url: 'http://YOUR_BACKEND_URL:3001',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
```

## Шаг 5: Билд проекта

```bash
npm run build
```

## Шаг 6: Добавление платформ

### iOS (требуется macOS + Xcode):
```bash
npm run cap:ios
```

### Android (требуется Android Studio):
```bash
npm run cap:android
```

## Шаг 7: Настройка API URL

Поскольку мобильное приложение не может использовать `localhost`, нужно:

### Вариант 1: Обновить baseURL в api.ts для production

```typescript
// frontend/src/services/api.ts
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-backend.com/api'  // Production API
    : 'http://localhost:3001/api')    // Development API

const api = axios.create({ baseURL })
```

### Вариант 2: Добавить .env файлы

```bash
# frontend/.env.production
VITE_API_URL=https://your-backend.com/api

# frontend/.env.development
VITE_API_URL=http://localhost:3001/api
```

## Шаг 8: Добавление иконок и splash screen

### Подготовка изображений:

1. **App Icon**: 1024x1024px PNG (без прозрачности)
2. **Splash Screen**: 2732x2732px PNG

### Генерация ресурсов:

```bash
npm install -g cordova-res
cordova-res ios --skip-config --copy
cordova-res android --skip-config --copy
```

## Шаг 9: Тестирование на устройстве

### iOS:
1. Открыть проект в Xcode: `npx cap open ios`
2. Выбрать свое устройство или симулятор
3. Нажать Play (▶)

### Android:
1. Открыть проект в Android Studio: `npx cap open android`
2. Выбрать эмулятор или подключенное устройство
3. Нажать Run (▶)

## Шаг 10: Публикация

### iOS App Store:

1. Зарегистрироваться в Apple Developer Program ($99/год)
2. Создать App ID в Apple Developer Portal
3. В Xcode: Product → Archive
4. Upload to App Store Connect
5. Заполнить метаданные и скриншоты
6. Submit for Review

### Google Play Store:

1. Зарегистрироваться в Google Play Console ($25 единоразово)
2. Build → Generate Signed Bundle/APK
3. Выбрать "Android App Bundle"
4. Создать signing key
5. Upload в Play Console
6. Заполнить метаданные и скриншоты  
7. Submit for Review

## Дополнительные плагины Capacitor

Полезные плагины для улучшения приложения:

```bash
# Уведомления
npm install @capacitor/push-notifications

# Камера (для сканирования чеков)
npm install @capacitor/camera

# Биометрия (Touch ID/Face ID)
npm install @capacitor/biometric

# Хранилище
npm install @capacitor/preferences

# Статус бар
npm install @capacitor/status-bar
```

## Troubleshooting

### Проблема: CORS errors в мобильном приложении

**Решение**: Настроить CORS в backend для мобильных клиентов

```typescript
// backend/server.ts
app.use(cors({
  origin: ['http://localhost:3000', 'capacitor://localhost', 'ionic://localhost'],
  credentials: true
}))
```

### Проблема: Google OAuth не работает в приложении

**Решение**: Использовать Capacitor плагин для Google Sign-In

```bash
npm install @codetrix-studio/capacitor-google-auth
```

## Полезные ресурсы

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

