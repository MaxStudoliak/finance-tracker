import { Request, Response } from 'express'
import { prisma } from '../../prisma'

// Получить все транзакции пользователя
export const getTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { type, category, startDate, endDate } = req.query

    const where: any = { userId: req.user.id }

    if (type) where.type = type
    if (category) where.category = category
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate as string)
      if (endDate) where.date.lte = new Date(endDate as string)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    res.json({ transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ error: 'Ошибка при получении транзакций' })
  }
}

// Получить транзакцию по ID
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { id } = req.params

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!transaction) {
      return res.status(404).json({ error: 'Транзакция не найдена' })
    }

    res.json({ transaction })
  } catch (error) {
    console.error('Get transaction error:', error)
    res.status(500).json({ error: 'Ошибка при получении транзакции' })
  }
}

// Создать транзакцию
export const createTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { amount, type, category, description, date } = req.body

    // Валидация
    if (!amount || !type || !category) {
      return res.status(400).json({
        error: 'Amount, type и category обязательны'
      })
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        error: 'Type должен быть income или expense'
      })
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id
      }
    })

    res.status(201).json({
      message: 'Транзакция создана',
      transaction
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    res.status(500).json({ error: 'Ошибка при создании транзакции' })
  }
}

// Обновить транзакцию
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { id } = req.params
    const { amount, type, category, description, date } = req.body

    // Проверка существования транзакции
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Транзакция не найдена' })
    }

    // Валидация type если он передан
    if (type && type !== 'income' && type !== 'expense') {
      return res.status(400).json({
        error: 'Type должен быть income или expense'
      })
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) })
      }
    })

    res.json({
      message: 'Транзакция обновлена',
      transaction
    })
  } catch (error) {
    console.error('Update transaction error:', error)
    res.status(500).json({ error: 'Ошибка при обновлении транзакции' })
  }
}

// Удалить транзакцию
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { id } = req.params

    // Проверка существования транзакции
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Транзакция не найдена' })
    }

    await prisma.transaction.delete({
      where: { id }
    })

    res.json({ message: 'Транзакция удалена' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    res.status(500).json({ error: 'Ошибка при удалении транзакции' })
  }
}
