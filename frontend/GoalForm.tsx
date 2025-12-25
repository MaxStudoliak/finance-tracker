import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  goal?: Goal | null
}

export default function GoalForm({ open, onClose, onSuccess, goal }: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: ''
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
      })
    } else {
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: ''
      })
    }
  }, [goal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = goal
        ? `http://localhost:5001/api/goals/${goal.id}`
        : 'http://localhost:5001/api/goals'

      const response = await fetch(url, {
        method: goal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount),
          deadline: formData.deadline || null
        })
      })

      if (!response.ok) throw new Error('Failed to save goal')

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving goal:', error)
      alert(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {goal ? t('goals.editGoal') : t('goals.addNew')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label={t('goals.title')}
            fullWidth
            margin="normal"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <TextField
            label={t('goals.targetAmount')}
            type="number"
            fullWidth
            margin="normal"
            required
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            label={t('goals.currentAmount')}
            type="number"
            fullWidth
            margin="normal"
            value={formData.currentAmount}
            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            label={t('goals.deadline')}
            type="date"
            fullWidth
            margin="normal"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? `${t('common.save')}...` : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
