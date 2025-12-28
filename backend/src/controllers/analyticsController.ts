import { Request, Response } from 'express'
import { prisma } from '../prisma'

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const userId = req.user.id

    // Получить все транзакции пользователя
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })

    // Общий баланс
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Расходы по категориям
    const expensesByCategory: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
      })

    const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }))

    // Доходы по категориям
    const incomeByCategory: Record<string, number> = {}
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount
      })

    // Последние 6 месяцев: доходы и расходы
    const monthlyData: Record<string, { income: number; expense: number }> = {}

    transactions.forEach(t => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 }
      }

      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount
      } else {
        monthlyData[monthKey].expense += t.amount
      }
    })

    // Сортировка по месяцам и взять последние 6
    const sortedMonths = Object.keys(monthlyData).sort().slice(-6)
    const monthlyChartData = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-')

      return {
        month: monthNum,
        income: Math.round(monthlyData[month].income),
        expense: Math.round(monthlyData[month].expense)
      }
    })

    // Топ-5 трат
    const topExpenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        category: t.category,
        amount: t.amount,
        description: t.description,
        date: t.date
      }))

    // Текущий месяц vs предыдущий
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1)
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`

    const currentMonthExpense = monthlyData[currentMonthKey]?.expense || 0
    const prevMonthExpense = monthlyData[prevMonthKey]?.expense || 0

    const expenseChange = prevMonthExpense > 0
      ? Math.round(((currentMonthExpense - prevMonthExpense) / prevMonthExpense) * 100)
      : 0

    res.json({
      summary: {
        totalIncome: Math.round(totalIncome),
        totalExpense: Math.round(totalExpense),
        balance: Math.round(balance),
        transactionCount: transactions.length
      },
      categoryData,
      monthlyData: monthlyChartData,
      topExpenses,
      comparison: {
        currentMonth: Math.round(currentMonthExpense),
        previousMonth: Math.round(prevMonthExpense),
        changePercent: expenseChange
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: 'Ошибка при получении аналитики' })
  }
}
