import { Router } from 'express'
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addProgress
} from '../controllers/goalController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', getGoals)
router.post('/', createGoal)
router.put('/:id', updateGoal)
router.delete('/:id', deleteGoal)
router.patch('/:id/add-progress', addProgress)

export default router
