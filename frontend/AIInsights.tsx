import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material'
import { Psychology } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../store/themeStore'
import api from '../services/api'

export default function AIInsights() {
  const { t } = useTranslation()
  const { mode } = useThemeStore()
  const [advice, setAdvice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAIAdvice = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/ai/analyze')
      setAdvice(response.data.advice)
    } catch (err: any) {
      setError(
        err.response?.data?.error || t('ai.error')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Psychology color="primary" sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h6">{t('ai.advisor')}</Typography>
        </Box>

        {!advice && !loading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('ai.description')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Psychology />}
              onClick={getAIAdvice}
            >
              {t('ai.getInsights')}
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {advice && (
          <Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
              {advice}
            </Typography>
            <Button
              size="small"
              onClick={getAIAdvice}
              disabled={loading}
            >
              {t('ai.refresh')}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
