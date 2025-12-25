import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { AttachMoney } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useThemeStore, Currency } from '../store/themeStore'

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string()
})

type TransactionFormData = z.infer<typeof transactionSchema>

const CATEGORIES = {
  expense: ['food', 'transport', 'entertainment', 'utilities', 'healthcare', 'shopping', 'other'],
  income: ['salary', 'freelance', 'investment', 'other']
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  transaction?: any
}

export default function TransactionForm({ open, onClose, onSuccess, transaction }: Props) {
  const { t } = useTranslation()
  const { currency: globalCurrency, setCurrency } = useThemeStore()
  const [loading, setLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(globalCurrency)

  const currencies: Currency[] = ['UAH', 'USD', 'EUR', 'GBP', 'RUB', 'PLN']

  useEffect(() => {
    setSelectedCurrency(globalCurrency)
  }, [globalCurrency])

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ? {
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    } : {
      type: 'expense' as const,
      date: new Date().toISOString().split('T')[0]
    }
  })

  const type = watch('type')

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true)
    try {
      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, data)
      } else {
        await api.post('/transactions', data)
      }

      setCurrency(selectedCurrency)
      reset()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert(t('transactions.deleteError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {transaction ? t('transactions.editTransaction') : t('transactions.addNew')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  {...field}
                  exclusive
                  fullWidth
                  color="primary"
                >
                  <ToggleButton value="expense">{t('transactions.expense')}</ToggleButton>
                  <ToggleButton value="income">{t('transactions.income')}</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          </Box>

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactions.amount')}
                type="number"
                fullWidth
                margin="normal"
                error={!!errors.amount}
                helperText={errors.amount?.message}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            )}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>{t('profile.currency')}</InputLabel>
            <Select
              value={selectedCurrency}
              label={t('profile.currency')}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
              startAdornment={<AttachMoney sx={{ mr: 1, color: 'primary.main' }} />}
            >
              {currencies.map((curr) => (
                <MenuItem key={curr} value={curr}>
                  {t(`currencies.${curr}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('transactions.category')}
                fullWidth
                margin="normal"
                error={!!errors.category}
                helperText={errors.category?.message}
              >
                {CATEGORIES[type].map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(`transactions.categories.${cat}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactions.description')}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactions.date')}
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            )}
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
