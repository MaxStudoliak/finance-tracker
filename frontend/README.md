# Finance Tracker - AI-Powered Personal Finance

Умный трекер личных финансов с AI-советами

## Технологии

### Backend
- **Express** - Node.js фреймворк
- **Prisma** - ORM для работы с базой данных
- **SQLite** - База данных
- **JWT** - Аутентификация
- **OpenAI API** - AI-советы по финансам
- **TypeScript** - Типизация

### Frontend
- **React** - UI библиотека
- **Vite** - Build tool
- **Material-UI** - UI компоненты
- **React Router** - Маршрутизация
- **Zustand** - State management
- **React Hook Form + Zod** - Формы и валидация
- **Recharts** - Графики
- **Axios** - HTTP клиент
- **TypeScript** - Типизация

## Функционал

- ✅ Регистрация и авторизация
- ✅ Управление транзакциями (доходы/расходы)
- ✅ Категории транзакций
- ✅ Dashboard с аналитикой
- ✅ Графики и визуализация данных
- ✅ AI-советы по оптимизации бюджета
- ✅ Финансовые цели
- ✅ Бюджеты по категориям

## Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone <repository-url>
cd finance-tracker
```

### 2. Установить зависимости Backend
```bash
cd backend
yarn install
```

### 3. Настроить переменные окружения Backend
Создайте файл `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-your-openai-api-key"
FRONTEND_URL="http://localhost:3000"
```

### 4. Создать базу данных
```bash
cd backend
npx prisma migrate dev
```

### 5. Запустить Backend
```bash
cd backend
yarn dev
```

Backend будет доступен на `http://localhost:5000`

### 6. Установить зависимости Frontend
```bash
cd frontend
yarn install
```

### 7. Настроить переменные окружения Frontend
Создайте файл `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 8. Запустить Frontend
```bash
cd frontend
yarn dev
```

Frontend будет доступен на `http://localhost:3000`

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

### Транзакции
- `GET /api/transactions` - Получить все транзакции
- `POST /api/transactions` - Создать транзакцию
- `PUT /api/transactions/:id` - Обновить транзакцию
- `DELETE /api/transactions/:id` - Удалить транзакцию

### Цели
- `GET /api/goals` - Получить все цели
- `POST /api/goals` - Создать цель
- `PUT /api/goals/:id` - Обновить цель
- `DELETE /api/goals/:id` - Удалить цель

### Аналитика
- `GET /api/analytics` - Получить аналитику

### AI
- `POST /api/ai/analyze` - Получить AI-анализ

## Структура проекта

```
finance-tracker/
├── backend/                 # Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Controllers
│   │   ├── middleware/     # Middleware
│   │   ├── prisma.ts       # Prisma client
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── frontend/               # React приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## Скриншоты

(Добавьте скриншоты вашего приложения)

## Лицензия

MIT
