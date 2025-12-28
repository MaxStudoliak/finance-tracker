import { Request, Response } from 'express';
import { prisma } from '../../prisma';

// Получить все повторяющиеся транзакции
export const getRecurringTransactions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(recurringTransactions);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({ error: 'Ошибка при получении повторяющихся транзакций' });
  }
};

// Создать повторяющуюся транзакцию
export const createRecurringTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { amount, type, category, description, frequency, startDate, endDate } = req.body;

    // Валидация
    if (!amount || !type || !category || !frequency || !startDate) {
      return res.status(400).json({
        error: 'Сумма, тип, категория, частота и дата начала обязательны',
      });
    }

    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        type,
        category,
        description: description || null,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    res.status(201).json(recurringTransaction);
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(500).json({ error: 'Ошибка при создании повторяющейся транзакции' });
  }
};

// Обновить повторяющуюся транзакцию
export const updateRecurringTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { id } = req.params;
    const { amount, description, isActive } = req.body;

    // Проверка владения
    const transaction = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Повторяющаяся транзакция не найдена' });
    }

    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const updatedTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(500).json({ error: 'Ошибка при обновлении повторяющейся транзакции' });
  }
};

// Удалить повторяющуюся транзакцию
export const deleteRecurringTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { id } = req.params;

    // Проверка владения
    const transaction = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Повторяющаяся транзакция не найдена' });
    }

    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await prisma.recurringTransaction.delete({
      where: { id },
    });

    res.json({ message: 'Повторяющаяся транзакция удалена' });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({ error: 'Ошибка при удалении повторяющейся транзакции' });
  }
};

// Переключить активность
export const toggleRecurringTransaction = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const { id } = req.params;

    // Проверка владения
    const transaction = await prisma.recurringTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Повторяющаяся транзакция не найдена' });
    }

    if (transaction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const updatedTransaction = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        isActive: !transaction.isActive,
      },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error toggling recurring transaction:', error);
    res.status(500).json({ error: 'Ошибка при переключении повторяющейся транзакции' });
  }
};
