import { Router } from 'express'
import { analyzeFinances, predictExpenses } from '../controllers/aiController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.post('/analyze', analyzeFinances)
router.post('/predict', predictExpenses)

export default router
