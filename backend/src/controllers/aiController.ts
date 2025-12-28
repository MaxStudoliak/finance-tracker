import { Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '../../prisma'

// Получить название валюты
const getCurrencyName = (currency: string, lang: string): string => {
  const currencies: Record<string, Record<string, string>> = {
    USD: { en: 'USD', ru: 'долл.', uk: 'дол.' },
    EUR: { en: 'EUR', ru: 'евро', uk: 'євро' },
    UAH: { en: 'UAH', ru: 'грн.', uk: 'грн.' }
  }
  return currencies[currency]?.[lang] || currency
}

export const analyzeFinances = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { language = 'ru', currency = 'USD' } = req.body
    const currencySymbol = getCurrencyName(currency, language)

    // Инициализируем Gemini API клиент
    console.log('🔑 [analyzeFinances] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    console.log('🔑 [analyzeFinances] GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length)

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(503).json({
        error: 'Google Gemini API key не настроен. Пожалуйста, добавьте ваш API ключ в backend/.env (GEMINI_API_KEY=your-key)'
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    console.log('✅ [analyzeFinances] Gemini client initialized')

    // Получить транзакции пользователя за последний месяц
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: oneMonthAgo
        }
      },
      orderBy: { date: 'desc' }
    })

    if (transactions.length === 0) {
      const messages: Record<string, string> = {
        en: 'Not enough data for analysis. Add some transactions to get personalized recommendations.',
        ru: 'Недостаточно данных для анализа. Добавьте несколько транзакций, чтобы получить персональные рекомендации.',
        uk: 'Недостатньо даних для аналізу. Додайте кілька транзакцій, щоб отримати персоналізовані рекомендації.'
      }
      return res.json({
        advice: messages[language] || messages['en']
      })
    }

    // Подготовка данных для AI
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const expensesByCategory: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
      })

    const categoryPercentages = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / totalExpense) * 100)
      }))
      .sort((a, b) => b.amount - a.amount)

    // Формирование промпта для Gemini
    const prompts: Record<string, string> = {
      en: `You are a financial advisor. Analyze the user's financial data for the last month and give brief personalized recommendations.

Data:
- Total income: ${Math.round(totalIncome)} ${currencySymbol}
- Total expenses: ${Math.round(totalExpense)} ${currencySymbol}
- Balance: ${Math.round(totalIncome - totalExpense)} ${currencySymbol}

Expenses by category:
${categoryPercentages.map(c => `- ${c.category}: ${Math.round(c.amount)} ${currencySymbol} (${c.percentage}%)`).join('\n')}

Give 3-4 specific tips for budget optimization. Be brief, friendly, and constructive. Compare spending with typical norms (e.g., food typically takes 25-30% of budget).`,

      ru: `Ты - финансовый советник. Проанализируй финансовые данные пользователя за последний месяц и дай краткие персональные рекомендации.

Данные:
- Общий доход: ${Math.round(totalIncome)} ${currencySymbol}
- Общие расходы: ${Math.round(totalExpense)} ${currencySymbol}
- Баланс: ${Math.round(totalIncome - totalExpense)} ${currencySymbol}

Расходы по категориям:
${categoryPercentages.map(c => `- ${c.category}: ${Math.round(c.amount)} ${currencySymbol} (${c.percentage}%)`).join('\n')}

Дай 3-4 конкретных совета по оптимизации бюджета. Будь кратким, дружелюбным и конструктивным. Сравни траты с типичными нормами (например, на еду обычно тратится 25-30% бюджета).`,

      uk: `Ти - фінансовий радник. Проаналізуй фінансові дані користувача за останній місяць і дай короткі персоналізовані рекомендації.

Дані:
- Загальний дохід: ${Math.round(totalIncome)} ${currencySymbol}
- Загальні витрати: ${Math.round(totalExpense)} ${currencySymbol}
- Баланс: ${Math.round(totalIncome - totalExpense)} ${currencySymbol}

Витрати за категоріями:
${categoryPercentages.map(c => `- ${c.category}: ${Math.round(c.amount)} ${currencySymbol} (${c.percentage}%)`).join('\n')}

Дай 3-4 конкретні поради щодо оптимізації бюджету. Будь стислим, дружелюбним і конструктивним. Порівняй витрати з типовими нормами (наприклад, на їжу зазвичай витрачається 25-30% бюджету).`
    }

    const prompt = prompts[language] || prompts['en']

    // Запрос к Gemini
    console.log('🤖 Requesting Gemini API with model: gemini-2.5-flash')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    console.log('✅ Gemini response received')
    const advice = result.response.text() || 'Не удалось получить совет'

    res.json({
      advice,
      summary: {
        totalIncome: Math.round(totalIncome),
        totalExpense: Math.round(totalExpense),
        balance: Math.round(totalIncome - totalExpense),
        topCategories: categoryPercentages.slice(0, 3)
      }
    })
  } catch (error: any) {
    console.error('❌ AI analysis error:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)

    res.status(500).json({
      error: 'Ошибка при анализе данных: ' + (error.message || 'Неизвестная ошибка')
    })
  }
}

export const predictExpenses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { language = 'ru', currency = 'USD' } = req.body
    const currencySymbol = getCurrencyName(currency, language)

    // Инициализируем Gemini API клиент
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return res.status(503).json({
        error: 'Google Gemini API key не настроен. Пожалуйста, добавьте ваш API ключ в backend/.env (GEMINI_API_KEY=your-key)'
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Получить транзакции за последние 3 месяца для более точного прогноза
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: threeMonthsAgo
        }
      },
      orderBy: { date: 'desc' }
    })

    if (transactions.length < 10) {
      const messages: Record<string, string> = {
        en: 'Not enough historical data for accurate forecast. Add more transactions (at least 10 in the last 3 months).',
        ru: 'Недостаточно исторических данных для точного прогноза. Добавьте больше транзакций (минимум 10 за последние 3 месяца).',
        uk: 'Недостатньо історичних даних для точного прогнозу. Додайте більше транзакцій (мінімум 10 за останні 3 місяці).'
      }
      return res.json({
        prediction: messages[language] || messages['en'],
        predictions: null
      })
    }

    // Группировка по месяцам
    const monthlyData: Record<string, { income: number; expense: number; byCategory: Record<string, number> }> = {}

    transactions.forEach(t => {
      const monthKey = new Date(t.date).toISOString().slice(0, 7) // "2025-12"
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, byCategory: {} }
      }

      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount
      } else {
        monthlyData[monthKey].expense += t.amount
        monthlyData[monthKey].byCategory[t.category] = (monthlyData[monthKey].byCategory[t.category] || 0) + t.amount
      }
    })

    // Расчет средних значений
    const months = Object.keys(monthlyData)
    const avgIncome = months.reduce((sum, m) => sum + monthlyData[m].income, 0) / months.length
    const avgExpense = months.reduce((sum, m) => sum + monthlyData[m].expense, 0) / months.length

    // Средние расходы по категориям
    const avgByCategory: Record<string, number> = {}
    months.forEach(month => {
      Object.entries(monthlyData[month].byCategory).forEach(([cat, amount]) => {
        avgByCategory[cat] = (avgByCategory[cat] || 0) + amount / months.length
      })
    })

    // Получение повторяющихся транзакций на следующий месяц
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      }
    })

    const recurringExpenseNext = recurringTransactions
      .filter(rt => rt.type === 'expense')
      .reduce((sum, rt) => sum + rt.amount, 0)

    const recurringIncomeNext = recurringTransactions
      .filter(rt => rt.type === 'income')
      .reduce((sum, rt) => sum + rt.amount, 0)

    // Формирование промпта для Gemini
    const prompts: Record<string, string> = {
      en: `Based on historical data, make a forecast of the user's expenses for the next month.

Data for the last ${months.length} months:
- Average income: ${Math.round(avgIncome)} ${currencySymbol}
- Average expenses: ${Math.round(avgExpense)} ${currencySymbol}

Average expenses by category:
${Object.entries(avgByCategory).map(([cat, amount]) => `- ${cat}: ${Math.round(amount)} ${currencySymbol}`).join('\n')}

Recurring payments for next month:
- Expenses: ${Math.round(recurringExpenseNext)} ${currencySymbol}
- Income: ${Math.round(recurringIncomeNext)} ${currencySymbol}

Make a brief forecast for next month taking into account trends and recurring payments. Give specific numbers and budget planning advice.`,

      ru: `На основе исторических данных сделай прогноз расходов пользователя на следующий месяц.

Данные за последние ${months.length} месяца:
- Средний доход: ${Math.round(avgIncome)} ${currencySymbol}
- Средние расходы: ${Math.round(avgExpense)} ${currencySymbol}

Средние расходы по категориям:
${Object.entries(avgByCategory).map(([cat, amount]) => `- ${cat}: ${Math.round(amount)} ${currencySymbol}`).join('\n')}

Повторяющиеся платежи на следующий месяц:
- Расходы: ${Math.round(recurringExpenseNext)} ${currencySymbol}
- Доходы: ${Math.round(recurringIncomeNext)} ${currencySymbol}

Сделай краткий прогноз на следующий месяц с учетом трендов и повторяющихся платежей. Дай конкретные цифры и советы по планированию бюджета.`,

      uk: `На основі історичних даних зроби прогноз витрат користувача на наступний місяць.

Дані за останні ${months.length} місяці:
- Середній дохід: ${Math.round(avgIncome)} ${currencySymbol}
- Середні витрати: ${Math.round(avgExpense)} ${currencySymbol}

Середні витрати за категоріями:
${Object.entries(avgByCategory).map(([cat, amount]) => `- ${cat}: ${Math.round(amount)} ${currencySymbol}`).join('\n')}

Повторювані платежі на наступний місяць:
- Витрати: ${Math.round(recurringExpenseNext)} ${currencySymbol}
- Доходи: ${Math.round(recurringIncomeNext)} ${currencySymbol}

Зроби короткий прогноз на наступний місяць з урахуванням трендів і повторюваних платежів. Дай конкретні цифри та поради щодо планування бюджету.`
    }

    const prompt = prompts[language] || prompts['en']

    // Запрос к Gemini
    console.log('🤖 [predictExpenses] Requesting Gemini API with model: gemini-2.5-flash')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    console.log('✅ [predictExpenses] Gemini response received')
    const prediction = result.response.text() || 'Не удалось получить прогноз'

    // Простой расчет прогноза (средние + повторяющиеся)
    const predictedExpense = Math.round(avgExpense + recurringExpenseNext)
    const predictedIncome = Math.round(avgIncome + recurringIncomeNext)

    res.json({
      prediction,
      predictions: {
        expectedIncome: predictedIncome,
        expectedExpense: predictedExpense,
        expectedBalance: predictedIncome - predictedExpense,
        categoryPredictions: Object.entries(avgByCategory).map(([category, amount]) => ({
          category,
          amount: Math.round(amount)
        })),
        recurringExpenses: Math.round(recurringExpenseNext),
        recurringIncome: Math.round(recurringIncomeNext)
      }
    })
  } catch (error: any) {
    console.error('AI prediction error:', error)

    res.status(500).json({
      error: 'Ошибка при прогнозировании. Убедитесь, что GEMINI_API_KEY настроен в backend/.env'
    })
  }
}
