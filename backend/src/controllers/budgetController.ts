import { Request, Response } from 'express';
import { prisma } from '../../prisma';

// Получить все бюджеты пользователя
export const getBudgets = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { month } = req.query;

    const where: any = { userId: req.user.id };
    if (month) {
      where.month = month as string;
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Получаем траты по каждой категории за указанный месяц
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId: req.user!.id,
            type: 'expense',
            category: budget.category,
            date: {
              gte: new Date(`${budget.month}-01`),
              lt: new Date(
                new Date(`${budget.month}-01`).getFullYear(),
                new Date(`${budget.month}-01`).getMonth() + 1,
                1
              ),
            },
          },
          _sum: {
            amount: true,
          },
        });

        return {
          ...budget,
          spent: spent._sum.amount || 0,
          remaining: budget.limit - (spent._sum.amount || 0),
          percentage: ((spent._sum.amount || 0) / budget.limit) * 100,
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Ошибка при получении бюджетов' });
  }
};

// Создать новый бюджет
export const createBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { category, limit, month } = req.body;

    // Валидация
    if (!category || !limit || !month) {
      return res.status(400).json({
        error: 'Категория, лимит и месяц обязательны',
      });
    }

    // Проверка существования бюджета
    const existingBudget = await prisma.budget.findUnique({
      where: {
        userId_category_month: {
          userId: req.user.id,
          category,
          month,
        },
      },
    });

    if (existingBudget) {
      return res.status(400).json({
        error: 'Бюджет для этой категории в этом месяце уже существует',
      });
    }

    const budget = await prisma.budget.create({
      data: {
        userId: req.user.id,
        category,
        limit: parseFloat(limit),
        month,
      },
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Ошибка при создании бюджета' });
  }
};

// Обновить бюджет
export const updateBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { id } = req.params;
    const { limit } = req.body;

    // Проверка владения
    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Бюджет не найден' });
    }

    if (budget.userId !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        limit: limit ? parseFloat(limit) : undefined,
      },
    });

    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Ошибка при обновлении бюджета' });
  }
};

// Удалить бюджет
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { id } = req.params;

    // Проверка владения
    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget) {
      return res.status(404).json({ error: 'Бюджет не найден' });
    }

    if (budget.userId !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await prisma.budget.delete({
      where: { id },
    });

    res.json({ message: 'Бюджет удален' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Ошибка при удалении бюджета' });
  }
};
