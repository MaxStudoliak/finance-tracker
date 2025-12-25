import { Request, Response } from 'express'
import { prisma } from '../prisma'

// GET /api/goals - получить все цели пользователя
export const getGoals = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ goals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    res.status(500).json({ error: 'Ошибка при получении целей' })
  }
}

// POST /api/goals - создать новую цель
export const createGoal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { title, targetAmount, currentAmount, deadline } = req.body

    if (!title || !targetAmount) {
      return res.status(400).json({ error: 'Название и целевая сумма обязательны' })
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        userId: req.user.id
      }
    })

    res.status(201).json(goal)
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ error: 'Ошибка при создании цели' })
  }
}

// PUT /api/goals/:id - обновить цель
export const updateGoal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { id } = req.params
    const { title, targetAmount, currentAmount, deadline } = req.body

    // Проверить что цель принадлежит пользователю
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: req.user.id }
    })

    if (!existingGoal) {
      return res.status(404).json({ error: 'Цель не найдена' })
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        title: title || existingGoal.title,
        targetAmount: targetAmount ? parseFloat(targetAmount) : existingGoal.targetAmount,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : existingGoal.currentAmount,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existingGoal.deadline
      }
    })

    res.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    res.status(500).json({ error: 'Ошибка при обновлении цели' })
  }
}

// DELETE /api/goals/:id - удалить цель
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { id } = req.params

    // Проверить что цель принадлежит пользователю
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: req.user.id }
    })

    if (!existingGoal) {
      return res.status(404).json({ error: 'Цель не найдена' })
    }

    await prisma.goal.delete({
      where: { id }
    })

    res.json({ message: 'Цель удалена' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    res.status(500).json({ error: 'Ошибка при удалении цели' })
  }
}

// PATCH /api/goals/:id/add-progress - добавить прогресс к цели
export const addProgress = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const { id } = req.params
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть положительной' })
    }

    // Проверить что цель принадлежит пользователю
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: req.user.id }
    })

    if (!existingGoal) {
      return res.status(404).json({ error: 'Цель не найдена' })
    }

    const newCurrentAmount = existingGoal.currentAmount + parseFloat(amount)

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: newCurrentAmount
      }
    })

    res.json(goal)
  } catch (error) {
    console.error('Error adding progress:', error)
    res.status(500).json({ error: 'Ошибка при добавлении прогресса' })
  }
}
