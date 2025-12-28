import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cron from 'node-cron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import passport from './src/config/passport'
import authRoutes from './src/routes/authRoutes'
import transactionRoutes from './src/routes/transactionRoutes'
import analyticsRoutes from './src/routes/analyticsRoutes'
import aiRoutes from './src/routes/aiRoutes'
import goalRoutes from './src/routes/goalRoutes'
import budgetRoutes from './src/routes/budgetRoutes'
import recurringTransactionRoutes from './src/routes/recurringTransactionRoutes'
import { processRecurringTransactions } from './src/utils/processRecurringTransactions'

// Load environment variables
const envPath = join(process.cwd(), '.env')
console.log('Loading .env from:', envPath)
const result = dotenv.config({ path: envPath })
if (result.error) {
  console.error('Error loading .env:', result.error)
} else {
  console.log('✅ Loaded environment variables:', Object.keys(result.parsed || {}).length)
}

const app: Express = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  // Capacitor origins
  'capacitor://localhost',
  'ionic://localhost',
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Finance Tracker API' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/recurring-transactions', recurringTransactionRoutes)

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// Cron job для обработки повторяющихся транзакций
// Запускается каждый день в 00:01
cron.schedule('1 0 * * *', async () => {
  console.log('⏰ Running daily recurring transactions cron job');
  await processRecurringTransactions();
});

// Обработка при старте сервера (опционально)
processRecurringTransactions();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
