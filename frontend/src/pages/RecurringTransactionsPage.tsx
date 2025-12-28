import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RepeatIcon from '@mui/icons-material/Repeat';
import Header from '../components/Header';
import api from '../services/api';
import { useCurrency } from '../utils/currency';
import RecurringFormDialog from '../components/RecurringFormDialog';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { format } from 'date-fns';
import { ru, uk, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface RecurringTransaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string | null;
  frequency: string;
  startDate: string;
  endDate: string | null;
  lastProcessed: string | null;
  isActive: boolean;
}

// Mapping from localized category names to English keys
const CATEGORY_NAME_TO_KEY: Record<string, string> = {
  // Russian
  'еда': 'food',
  'транспорт': 'transport',
  'развлечения': 'entertainment',
  'коммунальные услуги': 'utilities',
  'здоровье': 'healthcare',
  'покупки': 'shopping',
  'образование': 'education',
  'зарплата': 'salary',
  'фриланс': 'freelance',
  'инвестиции': 'investment',
  'подарок': 'gift',
  'другое': 'other',
  // Ukrainian
  'їжа': 'food',
  'комунальні послуги': 'utilities',
  "здоров'я": 'healthcare',
  'розваги': 'entertainment',
  'освіта': 'education',
  'фріланс': 'freelance',
  'інвестиції': 'investment',
  'подарунок': 'gift',
  'інше': 'other',
  // English (already keys)
  'food': 'food',
  'transport': 'transport',
  'entertainment': 'entertainment',
  'utilities': 'utilities',
  'healthcare': 'healthcare',
  'shopping': 'shopping',
  'education': 'education',
  'salary': 'salary',
  'freelance': 'freelance',
  'investment': 'investment',
  'gift': 'gift',
  'other': 'other',
}

const getCategoryKey = (category: string) => {
  const normalized = category.toLowerCase().trim()
  return CATEGORY_NAME_TO_KEY[normalized] || normalized.replace(/\s+/g, '_')
}

const getDateLocale = (language: string) => {
  switch (language) {
    case 'ru':
      return ru;
    case 'uk':
      return uk;
    default:
      return enUS;
  }
};

const RecurringTransactionsPage = () => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; transactionId: string | null }>({
    open: false,
    transactionId: null,
  });
  const formatCurrency = useCurrency();
  const dateLocale = getDateLocale(i18n.language);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recurring-transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setOpenDialog(true);
  };

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setOpenDialog(true);
  };

  const handleDeleteTransaction = async () => {
    if (!deleteModal.transactionId) return;

    try {
      await api.delete(`/recurring-transactions/${deleteModal.transactionId}`);
      setDeleteModal({ open: false, transactionId: null });
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.patch(`/recurring-transactions/${id}/toggle`);
      fetchTransactions();
    } catch (error) {
      console.error('Error toggling transaction:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleSaveSuccess = () => {
    fetchTransactions();
    handleCloseDialog();
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {t('recurring.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTransaction}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {t('recurring.addNew')}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          {t('recurring.info')}
        </Alert>

        {transactions.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('recurring.noRecurring')} {t('recurring.createFirst')}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {transactions.map((transaction) => (
              <Grid item xs={12} md={6} lg={4} key={transaction.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderLeft: `4px solid ${transaction.type === 'income' ? '#4caf50' : '#f44336'}`,
                    opacity: transaction.isActive ? 1 : 0.6,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RepeatIcon color="action" />
                        <Typography variant="h6" fontWeight="bold">
                          {t(`transactions.categories.${getCategoryKey(transaction.category)}`)}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditTransaction(transaction)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteModal({ open: true, transactionId: transaction.id })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" fontWeight="bold" color={transaction.type === 'income' ? 'success.main' : 'error.main'}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </Typography>
                      <Chip
                        label={t(`transactions.${transaction.type}`)}
                        size="small"
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        sx={{ mt: 1 }}
                      />
                    </Box>

                    {transaction.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {transaction.description}
                      </Typography>
                    )}

                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={t(`recurring.frequencies.${transaction.frequency}`)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('recurring.startDate')}: {format(new Date(transaction.startDate), 'dd MMM yyyy', { locale: dateLocale })}
                    </Typography>

                    {transaction.endDate && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {t('recurring.endDate')}: {format(new Date(transaction.endDate), 'dd MMM yyyy', { locale: dateLocale })}
                      </Typography>
                    )}

                    {transaction.lastProcessed && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {t('recurring.lastProcessed')}: {format(new Date(transaction.lastProcessed), 'dd MMM yyyy', { locale: dateLocale })}
                      </Typography>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={transaction.isActive}
                          onChange={() => handleToggleActive(transaction.id)}
                          color="primary"
                        />
                      }
                      label={transaction.isActive ? t('recurring.isActive') : t('recurring.isInactive')}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <RecurringFormDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSuccess={handleSaveSuccess}
          editingTransaction={editingTransaction}
        />

        <DeleteConfirmationModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, transactionId: null })}
          onConfirm={handleDeleteTransaction}
          message={t('recurring.deleteConfirm')}
        />
      </Container>
    </Box>
  );
};

export default RecurringTransactionsPage;
