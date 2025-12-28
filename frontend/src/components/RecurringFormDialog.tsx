import { useState, useEffect } from 'react';
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
} from '@mui/material';
import api from '../services/api';
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
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransaction: RecurringTransaction | null;
}

const CATEGORIES: Record<string, string[]> = {
  expense: ['food', 'transport', 'entertainment', 'healthcare', 'shopping', 'utilities', 'education', 'other'],
  income: ['salary', 'freelance', 'investment', 'gift', 'other'],
};

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

const RecurringFormDialog = ({ open, onClose, onSuccess, editingTransaction }: Props) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        description: editingTransaction.description || '',
        frequency: editingTransaction.frequency,
        startDate: editingTransaction.startDate.split('T')[0],
        endDate: editingTransaction.endDate ? editingTransaction.endDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    }
  }, [editingTransaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        endDate: formData.endDate || undefined,
      };

      if (editingTransaction) {
        await api.put(`/recurring-transactions/${editingTransaction.id}`, {
          amount: data.amount,
          description: data.description,
        });
      } else {
        await api.post('/recurring-transactions', data);
      }

      onSuccess();
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingTransaction ? t('recurring.editRecurring') : t('recurring.addNew')}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={(_, value) => value && setFormData({ ...formData, type: value, category: '' })}
              fullWidth
              color="primary"
              disabled={!!editingTransaction}
            >
              <ToggleButton value="expense">{t('transactions.expense')}</ToggleButton>
              <ToggleButton value="income">{t('transactions.income')}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label={t('transactions.amount')}
            type="number"
            fullWidth
            margin="normal"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            select
            label={t('transactions.category')}
            fullWidth
            margin="normal"
            required
            disabled={!!editingTransaction}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES[formData.type as keyof typeof CATEGORIES].map((cat) => (
              <MenuItem key={cat} value={cat}>
                {t(`transactions.categories.${cat}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('transactions.description')}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <TextField
            select
            label={t('recurring.frequency')}
            fullWidth
            margin="normal"
            required
            disabled={!!editingTransaction}
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          >
            {FREQUENCIES.map((freq) => (
              <MenuItem key={freq} value={freq}>
                {t(`recurring.frequencies.${freq}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('recurring.startDate')}
            type="date"
            fullWidth
            margin="normal"
            required
            disabled={!!editingTransaction}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label={t('recurring.endDate')}
            type="date"
            fullWidth
            margin="normal"
            disabled={!!editingTransaction}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
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

export default RecurringFormDialog;
