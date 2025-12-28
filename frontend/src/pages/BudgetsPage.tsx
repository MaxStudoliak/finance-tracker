import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Header from '../components/Header';
import api from '../services/api';
import { useCurrency } from '../utils/currency';
import BudgetFormDialog from '../components/BudgetFormDialog';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useTranslation } from 'react-i18next';

interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
  spent: number;
  remaining: number;
  percentage: number;
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
  'другое': 'other',
  // Ukrainian
  'їжа': 'food',
  'комунальні послуги': 'utilities',
  "здоров'я": 'healthcare',
  'розваги': 'entertainment',
  'освіта': 'education',
  'інше': 'other',
  // English (already keys)
  'food': 'food',
  'transport': 'transport',
  'entertainment': 'entertainment',
  'utilities': 'utilities',
  'healthcare': 'healthcare',
  'shopping': 'shopping',
  'education': 'education',
  'other': 'other',
}

const getCategoryKey = (category: string) => {
  const normalized = category.toLowerCase().trim()
  return CATEGORY_NAME_TO_KEY[normalized] || normalized.replace(/\s+/g, '_')
}

const BudgetsPage = () => {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; budgetId: string | null }>({
    open: false,
    budgetId: null,
  });
  const formatCurrency = useCurrency();

  // Текущий месяц по умолчанию
  const currentMonth = new Date().toISOString().slice(0, 7); // "2025-12"
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/budgets?month=${selectedMonth}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth]);

  const handleAddBudget = () => {
    setEditingBudget(null);
    setOpenDialog(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setOpenDialog(true);
  };

  const handleDeleteBudget = async () => {
    if (!deleteModal.budgetId) return;

    try {
      await api.delete(`/budgets/${deleteModal.budgetId}`);
      setDeleteModal({ open: false, budgetId: null });
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSaveSuccess = () => {
    fetchBudgets();
    handleCloseDialog();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) {
      return <WarningIcon color="error" />;
    }
    if (percentage >= 90) {
      return <WarningIcon color="warning" />;
    }
    return <CheckCircleIcon color="success" />;
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {t('budgets.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBudget}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {t('budgets.addNew')}
          </Button>
        </Box>

        {budgets.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('budgets.noBudgets')} {t('budgets.createFirst')}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderTop: `4px solid ${budget.percentage >= 90 ? '#f44336' : budget.percentage >= 75 ? '#ff9800' : '#4caf50'
                      }`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(budget.percentage)}
                        <Typography variant="h6" fontWeight="bold">
                          {t(`transactions.categories.${getCategoryKey(budget.category)}`)}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditBudget(budget)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteModal({ open: true, budgetId: budget.id })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(budget.percentage, 100)}
                        color={getProgressColor(budget.percentage)}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {budget.percentage.toFixed(1)}% {t('budgets.used')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('budgets.spent')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(budget.spent)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('budgets.limit')}:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(budget.limit)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('budgets.remaining')}:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={budget.remaining < 0 ? 'error' : 'success.main'}
                      >
                        {formatCurrency(budget.remaining)}
                      </Typography>
                    </Box>

                    {budget.percentage >= 90 && (
                      <Alert severity={budget.percentage >= 100 ? 'error' : 'warning'} sx={{ mt: 2 }}>
                        {budget.percentage >= 100
                          ? t('budgets.exceeded')
                          : t('budgets.approaching')}
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <BudgetFormDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSuccess={handleSaveSuccess}
          editingBudget={editingBudget}
          selectedMonth={selectedMonth}
        />

        <DeleteConfirmationModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, budgetId: null })}
          onConfirm={handleDeleteBudget}
          message={t('budgets.deleteConfirm')}
        />
      </Container>
    </Box>
  );
};

export default BudgetsPage;
