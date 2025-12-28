import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBudget: Budget | null;
  selectedMonth: string;
}

const CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'healthcare',
  'shopping',
  'utilities',
  'education',
  'other',
];

const BudgetFormDialog = ({ open, onClose, onSuccess, editingBudget, selectedMonth }: Props) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    month: selectedMonth,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Генерируем список месяцев (текущий год + следующий год)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Генерируем месяцы для текущего года и следующего
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const value = `${year}-${monthStr}`;
        const label = `${t(`months.${monthStr}`)} ${year}`;
        options.push({ value, label });
      }
    }

    return options;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category,
        limit: editingBudget.limit.toString(),
        month: editingBudget.month,
      });
    } else {
      setFormData({
        category: '',
        limit: '',
        month: selectedMonth,
      });
    }
  }, [editingBudget, selectedMonth, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}`, {
          limit: parseFloat(formData.limit),
        });
      } else {
        await api.post('/budgets', {
          ...formData,
          limit: parseFloat(formData.limit),
        });
      }

      onSuccess();
      setFormData({ category: '', limit: '', month: selectedMonth });
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingBudget ? t('budgets.editBudget') : t('budgets.addNew')}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>
          )}

          <TextField
            select
            label={t('budgets.category')}
            fullWidth
            margin="normal"
            required
            disabled={!!editingBudget}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {t(`transactions.categories.${cat}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('budgets.limit')}
            type="number"
            fullWidth
            margin="normal"
            required
            value={formData.limit}
            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            select
            label={t('budgets.month')}
            fullWidth
            margin="normal"
            required
            disabled={!!editingBudget}
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
          >
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BudgetFormDialog;
