import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  goalId: string
  goalTitle: string
}

export default function AddProgressDialog({ open, onClose, onSuccess, goalId, goalTitle }: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:5001/api/goals/${goalId}/add-progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      })

      if (!response.ok) throw new Error('Failed to add progress')

      setAmount('')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding progress:', error)
      alert(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {t('goals.addProgress')} - {goalTitle}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label={t('goals.amount')}
            type="number"
            fullWidth
            margin="normal"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 0.01, step: 0.01 }}
            autoFocus
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
