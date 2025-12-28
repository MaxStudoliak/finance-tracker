import { prisma } from '../prisma';
import { addDays, addWeeks, addMonths, addYears, isAfter, isSameDay, startOfDay } from 'date-fns';

export async function processRecurringTransactions() {
  console.log('🔄 Processing recurring transactions...');

  try {
    // Получаем все активные повторяющиеся транзакции
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { isActive: true },
    });

    const today = startOfDay(new Date());
    let processedCount = 0;

    for (const recurring of recurringTransactions) {
      // Проверяем, не истек ли срок действия
      if (recurring.endDate && isAfter(today, startOfDay(recurring.endDate))) {
        // Деактивируем истекшую транзакцию
        await prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: { isActive: false },
        });
        continue;
      }

      // Определяем дату следующей обработки
      let nextDate = recurring.lastProcessed
        ? getNextDate(recurring.lastProcessed, recurring.frequency)
        : startOfDay(recurring.startDate);

      // Проверяем, нужно ли создать транзакцию сегодня
      if (!isAfter(nextDate, today)) {
        // Создаем транзакцию
        await prisma.transaction.create({
          data: {
            userId: recurring.userId,
            amount: recurring.amount,
            type: recurring.type,
            category: recurring.category,
            description: recurring.description || `[AUTO] ${recurring.category}`,
            date: today,
          },
        });

        // Обновляем lastProcessed
        await prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: { lastProcessed: today },
        });

        processedCount++;
      }
    }

    console.log(`✅ Processed ${processedCount} recurring transactions`);
  } catch (error) {
    console.error('❌ Error processing recurring transactions:', error);
  }
}

function getNextDate(lastDate: Date, frequency: string): Date {
  const date = startOfDay(lastDate);

  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    default:
      return addMonths(date, 1);
  }
}
