import { Router } from 'express';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
} from '../controllers/recurringTransactionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Все routes требуют аутентификации
router.use(authMiddleware);

router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);
router.patch('/:id/toggle', toggleRecurringTransaction);

export default router;
