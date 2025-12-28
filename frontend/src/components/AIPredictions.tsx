import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import api from '../services/api';
import { useCurrency } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/themeStore';

interface Prediction {
  expectedIncome: number;
  expectedExpense: number;
  expectedBalance: number;
  categoryPredictions: { category: string; amount: number }[];
  recurringExpenses: number;
  recurringIncome: number;
}

const AIPredictions = () => {
  const { t, i18n } = useTranslation();
  const { mode, currency } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formatCurrency = useCurrency();

  const handleGetPredictions = async () => {
    console.log('🔮 [AIPredictions] Starting prediction request...');
    console.log('🔮 Language:', i18n.language);
    console.log('🔮 Currency:', currency);

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/predict', {
        language: i18n.language,
        currency: currency
      });
      console.log('✅ [AIPredictions] Response received:', response.data);
      setPrediction(response.data.prediction);
      setPredictions(response.data.predictions);
    } catch (err: any) {
      console.error('❌ [AIPredictions] Error:', err);
      console.error('❌ [AIPredictions] Error response:', err.response?.data);
      setError(
        err.response?.data?.error || t('aiPredictions.error')
      );
      setPrediction(null);
      setPredictions(null);
    } finally {
      setLoading(false);
      console.log('🔮 [AIPredictions] Request completed');
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '2px solid',
        borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
        background: mode === 'dark'
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
          transform: 'translateY(-4px)',
          boxShadow: mode === 'dark'
            ? '0 8px 16px rgba(99, 102, 241, 0.2)'
            : '0 8px 16px rgba(99, 102, 241, 0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUpIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {t('aiPredictions.title')}
          </Typography>
        </Box>

        {!prediction && !loading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('aiPredictions.description')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleGetPredictions}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              {t('aiPredictions.getPredict')}
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGetPredictions}
                sx={{
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                  color: mode === 'dark' ? '#a5b4fc' : '#667eea',
                  '&:hover': {
                    borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.6)',
                    background: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  },
                }}
              >
                {t('common.retry') || 'Повторити'}
              </Button>
            </Box>
          </Box>
        )}

        {prediction && !predictions && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              {prediction}
            </Alert>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleGetPredictions}
                sx={{
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                  color: mode === 'dark' ? '#a5b4fc' : '#667eea',
                  '&:hover': {
                    borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.6)',
                    background: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  },
                }}
              >
                {t('common.retry') || 'Повторити'}
              </Button>
            </Box>
          </Box>
        )}

        {prediction && predictions && (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                  }}
                >
                  <Typography variant="caption">{t('aiPredictions.expectedIncome')}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(predictions.expectedIncome)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                  }}
                >
                  <Typography variant="caption">{t('aiPredictions.expectedExpense')}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(predictions.expectedExpense)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background:
                      predictions.expectedBalance >= 0
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #ff9800 0%, #fb8c00 100%)',
                    color: 'white',
                  }}
                >
                  <Typography variant="caption">{t('aiPredictions.expectedBalance')}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {predictions.expectedBalance >= 0 ? '+' : ''}
                    {formatCurrency(predictions.expectedBalance)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {predictions.recurringExpenses > 0 || predictions.recurringIncome > 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('aiPredictions.recurringInfo', {
                  expenses: formatCurrency(predictions.recurringExpenses),
                  income: formatCurrency(predictions.recurringIncome)
                })}
              </Alert>
            ) : null}

            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
              {prediction}
            </Typography>

            {predictions.categoryPredictions.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  {t('aiPredictions.categoryPredictions')}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {predictions.categoryPredictions.slice(0, 5).map((cat) => (
                    <Chip
                      key={cat.category}
                      label={`${cat.category}: ${formatCurrency(cat.amount)}`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Button
              variant="outlined"
              size="small"
              onClick={handleGetPredictions}
              sx={{
                mt: 2,
                borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                color: mode === 'dark' ? '#a5b4fc' : '#667eea',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.6)',
                  background: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                },
              }}
              fullWidth
            >
              {t('aiPredictions.updatePredict')}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPredictions;
