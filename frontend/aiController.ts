import { Request, Response } from 'express'
import OpenAI from 'openai'
import { prisma } from '../prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const analyzeFinances = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

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
      return res.json({
        advice: 'Недостаточно данных для анализа. Добавьте несколько транзакций, чтобы получить персональные рекомендации.'
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

    // Формирование промпта для OpenAI
    const prompt = `Ты - финансовый советник. Проанализируй финансовые данные пользователя за последний месяц и дай краткие персональные рекомендации.

Данные:
- Общий доход: ${Math.round(totalIncome)} руб.
- Общие расходы: ${Math.round(totalExpense)} руб.
- Баланс: ${Math.round(totalIncome - totalExpense)} руб.

Расходы по категориям:
${categoryPercentages.map(c => `- ${c.category}: ${Math.round(c.amount)} руб. (${c.percentage}%)`).join('\n')}

Дай 3-4 конкретных совета по оптимизации бюджета. Будь кратким, дружелюбным и конструктивным. Сравни траты с типичными нормами (например, на еду обычно тратится 25-30% бюджета).`

    // Запрос к OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Ты - профессиональный финансовый советник, который помогает людям управлять личными финансами.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const advice = completion.choices[0]?.message?.content || 'Не удалось получить совет'

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
    console.error('AI analysis error:', error)

    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        error: 'OpenAI API quota exceeded. Please add your own API key in backend/.env'
      })
    }

    res.status(500).json({
      error: 'Ошибка при анализе данных. Убедитесь, что OPENAI_API_KEY настроен в backend/.env'
    })
  }
}
