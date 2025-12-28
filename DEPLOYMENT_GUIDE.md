# 🚀 Deployment Guide: Vercel + Railway

## Подготовка завершена ✅

Ваш проект готов к деплою! Все конфигурационные файлы созданы.

---

## ЧАСТЬ 1: Деплой Backend на Railway 🚂

### Шаг 1: Создать аккаунт на Railway

1. Перейдите на https://railway.app
2. Нажмите "Start a New Project"
3. Авторизуйтесь через GitHub

### Шаг 2: Создать новый проект

1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Выберите репозиторий `finance-tracker`
4. Railway автоматически определит Node.js проект

### Шаг 3: Настроить переменные окружения

В Railway Dashboard → Variables, добавьте:

```bash
NODE_ENV=production
PORT=5001

# JWT Secret (создайте случайную строку)
JWT_SECRET=создайте-длинную-случайную-строку-здесь

# Google OAuth (ваши данные)
GOOGLE_CLIENT_ID=ваш-google-client-id
GOOGLE_CLIENT_SECRET=ваш-google-client-secret
GOOGLE_CALLBACK_URL=https://ваш-backend.railway.app/api/auth/google/callback

# Google Gemini AI
GEMINI_API_KEY=ваш-gemini-api-key

# Frontend URL (обновим после деплоя frontend)
FRONTEND_URL=https://ваш-frontend.vercel.app
```

### Шаг 4: Добавить PostgreSQL базу данных

1. В Railway проекте нажмите "New"
2. Выберите "Database" → "PostgreSQL"
3. Railway автоматически создаст переменную `DATABASE_URL`

### Шаг 5: Обновить Prisma schema для PostgreSQL

**ВАЖНО:** Перед деплоем обновите `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Изменить с sqlite на postgresql
  url      = env("DATABASE_URL")
}
```

Закоммитьте изменение:
```bash
git add backend/prisma/schema.prisma
git commit -m "Update Prisma to use PostgreSQL for production"
git push
```

### Шаг 6: Настроить Root Directory

1. В Railway Settings → найдите "Root Directory"
2. Установите: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

### Шаг 7: Инициализировать базу данных

После успешного деплоя:

1. Откройте Railway → Variables → DATABASE_URL (скопируйте значение)
2. В локальном проекте выполните:

```bash
cd backend
# Временно установите DATABASE_URL
export DATABASE_URL="postgresql://..."

# Примените миграции
npx prisma db push

# Или создайте миграцию
npx prisma migrate deploy
```

### Шаг 8: Получить URL backend

Railway покажет URL вида: `https://finance-tracker-backend.railway.app`

**Сохраните этот URL** - он понадобится для frontend!

---

## ЧАСТЬ 2: Деплой Frontend на Vercel ⚡

### Шаг 1: Установить Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Шаг 2: Задеплоить проект

```bash
cd frontend
vercel
```

Ответьте на вопросы:
- **Set up and deploy?** → Yes
- **Which scope?** → Ваш аккаунт
- **Link to existing project?** → No
- **Project name?** → finance-tracker (или свое название)
- **Directory?** → ./
- **Want to override settings?** → No

### Шаг 3: Настроить переменные окружения

После деплоя, в Vercel Dashboard:

1. Откройте проект "finance-tracker"
2. Settings → Environment Variables
3. Добавьте:

```bash
# Backend URL (из Railway, шаг 1.8)
VITE_API_URL=https://ваш-backend.railway.app/api

# Google OAuth (опционально)
VITE_GOOGLE_CLIENT_ID=ваш-google-client-id
```

### Шаг 4: Redeploy с переменными

```bash
vercel --prod
```

### Шаг 5: Получить URL frontend

Vercel покажет URL вида: `https://finance-tracker.vercel.app`

---

## ЧАСТЬ 3: Финальная настройка 🔧

### Шаг 1: Обновить CORS в Railway

Вернитесь в Railway → Variables и обновите:

```bash
FRONTEND_URL=https://ваш-frontend.vercel.app
```

### Шаг 2: Обновить Google OAuth URLs

В Google Cloud Console:

1. Authorized JavaScript origins:
   - `https://ваш-frontend.vercel.app`
   
2. Authorized redirect URIs:
   - `https://ваш-backend.railway.app/api/auth/google/callback`

### Шаг 3: Redeploy Backend

В Railway просто нажмите "Redeploy" для применения новых переменных

---

## ✅ Проверка работы

1. Откройте `https://ваш-frontend.vercel.app`
2. Попробуйте зарегистрироваться
3. Попробуйте войти через Google
4. Создайте тестовую транзакцию

---

## 📝 Полезные команды

### Обновить Frontend:
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push
# Vercel автоматически задеплоит
```

### Обновить Backend:
```bash
cd backend
git add .
git commit -m "Update backend"
git push
# Railway автоматически задеплоит
```

### Посмотреть логи:
- **Vercel**: Dashboard → Deployments → View Logs
- **Railway**: Dashboard → Deployments → View Logs

### Откатить изменения:
- **Vercel**: Dashboard → Deployments → Promote to Production
- **Railway**: Dashboard → Deployments → Rollback

---

## 🐛 Troubleshooting

### Проблема: CORS errors

**Решение**: Проверьте что `FRONTEND_URL` в Railway соответствует URL из Vercel

### Проблема: 500 Internal Server Error

**Решение**: 
1. Проверьте логи в Railway
2. Убедитесь что `DATABASE_URL` настроен
3. Убедитесь что `npx prisma db push` был выполнен

### Проблема: Google OAuth не работает

**Решение**: 
1. Проверьте `GOOGLE_CALLBACK_URL` в Railway
2. Обновите Authorized redirect URIs в Google Console
3. Убедитесь что домены совпадают (без trailing slash)

### Проблема: База данных пустая

**Решение**:
```bash
# Подключитесь к production БД и выполните миграции
export DATABASE_URL="postgresql://..."
npx prisma db push
```

---

## 🎉 Готово!

Ваше приложение теперь доступно онлайн:
- **Frontend**: https://ваш-frontend.vercel.app
- **Backend API**: https://ваш-backend.railway.app/api

Теперь можно делиться ссылкой с пользователями! 🚀
