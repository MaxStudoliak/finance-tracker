# Finance Tracker - Инструкции по настройке

## Новые функции

### 1. Google OAuth

Для настройки Google OAuth:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API
4. Создайте OAuth 2.0 учетные данные:
   - Тип приложения: Web application
   - Authorized redirect URIs: `http://localhost:5001/api/auth/google/callback`
5. Скопируйте Client ID и Client Secret
6. Добавьте в `backend/.env`:

```env
GOOGLE_CLIENT_ID="ваш-client-id"
GOOGLE_CLIENT_SECRET="ваш-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5001/api/auth/google/callback"
```

### 2. Бюджеты

- Создавайте месячные бюджеты для каждой категории расходов
- Отслеживайте прогресс в реальном времени
- Получайте предупреждения при приближении к лимиту (90%) и превышении (100%)
- Просматривайте сколько осталось потратить в каждой категории

**Доступ:** Навигация → Бюджеты

### 3. Повторяющиеся платежи (Подписки)

- Создавайте повторяющиеся транзакции (ежедневно, еженедельно, ежемесячно, ежегодно)
- Автоматическое создание транзакций каждый день в 00:01 через cron job
- Включение/выключение подписок
- Установка дат начала и окончания

**Доступ:** Навигация → Подписки

### 4. AI Прогнозы трат

- Прогноз доходов и расходов на следующий месяц
- Анализ на основе последних 3 месяцев
- Учет повторяющихся платежей
- Прогноз по категориям

**Доступ:** Dashboard → AI Прогноз (справа от AI Советника)

## Запуск приложения

### Backend

```bash
cd backend
yarn install
npx prisma db push
yarn dev
```

Backend запустится на http://localhost:5001

### Frontend

```bash
cd frontend
yarn install
yarn dev
```

Frontend запустится на http://localhost:3000

## Переменные окружения

### Backend (.env)

```env
# Database
DATABASE_URL="file:/Users/mac/git/finance-tracker/backend/prisma/dev.db"

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production-2025"
JWT_EXPIRES_IN="7d"

# OpenAI (для AI советника и прогнозов)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# CORS
FRONTEND_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
GOOGLE_CALLBACK_URL="http://localhost:5001/api/auth/google/callback"
```

## Cron Job для повторяющихся транзакций

Cron job автоматически запускается при старте сервера и работает каждый день в 00:01.

Для ручного запуска обработки (для тестирования):
- Просто перезапустите сервер - обработка запустится при старте

## API Endpoints

### Google OAuth
- `GET /api/auth/google` - Инициирует OAuth flow
- `GET /api/auth/google/callback` - Callback URL для Google

### Бюджеты
- `GET /api/budgets` - Получить все бюджеты (с query параметром ?month=2025-12)
- `POST /api/budgets` - Создать бюджет
- `PUT /api/budgets/:id` - Обновить бюджет
- `DELETE /api/budgets/:id` - Удалить бюджет

### Повторяющиеся транзакции
- `GET /api/recurring-transactions` - Получить все
- `POST /api/recurring-transactions` - Создать
- `PUT /api/recurring-transactions/:id` - Обновить
- `DELETE /api/recurring-transactions/:id` - Удалить
- `PATCH /api/recurring-transactions/:id/toggle` - Включить/выключить

### AI
- `POST /api/ai/analyze` - Получить AI анализ (существующий)
- `POST /api/ai/predict` - Получить AI прогноз на следующий месяц (новый)

## Новые маршруты Frontend

- `/auth/callback` - Google OAuth callback обработчик
- `/budgets` - Страница бюджетов
- `/recurring` - Страница повторяющихся транзакций

## Структура базы данных

### Обновленные модели

**User** (обновлена):
- Добавлено поле `googleId` для Google OAuth

**RecurringTransaction** (новая):
- amount, type, category, description
- frequency (daily, weekly, monthly, yearly)
- startDate, endDate
- lastProcessed - дата последней обработки
- isActive - активна ли подписка

**Budget** (уже существовала в схеме, теперь реализована):
- category, limit, month
- Unique constraint на (userId, category, month)

## Важные заметки

1. **Google OAuth**: Требует настройки в Google Cloud Console
2. **OpenAI API**: Требуется для AI функций (анализ и прогнозы)
3. **Cron Job**: Работает автоматически, обрабатывает транзакции каждый день
4. **Бюджеты**: Один бюджет на категорию в месяц
5. **Прогнозы**: Требуют минимум 10 транзакций за последние 3 месяца

## Следующие шаги

- Настройте Google OAuth credentials
- Добавьте свой OpenAI API key
- Создайте несколько тестовых транзакций
- Установите бюджеты
- Создайте повторяющиеся платежи (подписки)
- Получите AI прогноз
