import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material'
import { Add, Edit, Delete, Search } from '@mui/icons-material'
import { format } from 'date-fns'
import { ru, uk, enUS } from 'date-fns/locale'
import api from '../services/api'
import { useThemeStore } from '../store/themeStore'
import { formatCurrency } from '../utils/currency'
import Header from '../components/Header'
import TransactionForm from '../components/TransactionForm'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import { useTranslation } from 'react-i18next'

interface Transaction {
  id: string
  amount: number
  type: string
  category: string
  description: string | null
  date: string
}

export default function TransactionsPage() {
  const { mode, language, currency } = useThemeStore()
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Маппинг старых русских названий категорий на новые ключи
  const categoryKeyMap: Record<string, string> = {
    'Еда': 'food',
    'Транспорт': 'transport',
    'Развлечения': 'entertainment',
    'Здоровье': 'healthcare',
    'Покупки': 'shopping',
    'Жилье': 'utilities',
    'Образование': 'other',
    'Другое': 'other',
    'Зарплата': 'salary',
    'Фриланс': 'freelance',
    'Инвестиции': 'investment',
    'Подарок': 'other',
    'Коммунальные услуги': 'utilities',
  }

  const getCategoryKey = (category: string): string => {
    return categoryKeyMap[category] || category
  }

  const getDateLocale = () => {
    switch (language) {
      case 'ru':
        return ru
      case 'uk':
        return uk
      case 'en':
        return enUS
      default:
        return uk
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions')
      setTransactions(response.data.transactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) => {
    if (!debouncedSearchQuery) return true

    const description = transaction.description || ''
    return description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  })

  const handleDeleteClick = (id: string) => {
    setDeletingTransactionId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTransactionId) return

    try {
      await api.delete(`/transactions/${deletingTransactionId}`)
      fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert(t('transactions.deleteError'))
    } finally {
      setDeletingTransactionId(null)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingTransaction(null)
  }

  const handleFormSuccess = () => {
    fetchTransactions()
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('transactions.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            {t('transactions.addNew')}
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder={t('transactions.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.05)'
                  : 'rgba(99, 102, 241, 0.02)',
                '&:hover fieldset': {
                  borderColor: '#667eea',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                },
              },
            }}
          />
        </Box>

        {loading ? (
          <Typography>{t('common.loading')}</Typography>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('transactions.date')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('transactions.category')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('transactions.description')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('transactions.type')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{t('transactions.amount')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>{t('transactions.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {transactions.length === 0 ? t('transactions.addFirst') : t('transactions.noTransactions')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), 'dd MMM yyyy', { locale: getDateLocale() })}
                      </TableCell>
                      <TableCell>{t(`transactions.categories.${getCategoryKey(transaction.category)}`)}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type === 'income' ? t('transactions.income') : t('transactions.expense')}
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount, currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(transaction.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <TransactionForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        transaction={editingTransaction}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingTransactionId(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  )
}
