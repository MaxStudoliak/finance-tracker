import { Router } from 'express'
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Все routes требуют аутентификации
router.use(authMiddleware)

router.get('/', getTransactions)
router.get('/:id', getTransactionById)
router.post('/', createTransaction)
router.put('/:id', updateTransaction)
router.delete('/:id', deleteTransaction)

export default router
