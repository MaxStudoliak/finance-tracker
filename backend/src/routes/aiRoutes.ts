import { Router } from 'express'
import { analyzeFinances } from '../controllers/aiController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.post('/analyze', analyzeFinances)

export default router
