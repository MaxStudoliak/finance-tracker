import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
  IconButton,
  Button,
  Chip
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../store/themeStore'
import { formatCurrency } from '../utils/currency'
import { format, differenceInDays } from 'date-fns'
import { ru, uk, enUS } from 'date-fns/locale'

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
}

interface Props {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  onAddProgress: () => void
}

export default function GoalCard({ goal, onEdit, onDelete, onAddProgress }: Props) {
  const { t } = useTranslation()
  const { mode, language, currency } = useThemeStore()

  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const remaining = goal.targetAmount - goal.currentAmount

  const getDateLocale = () => {
    switch (language) {
      case 'ru': return ru
      case 'uk': return uk
      case 'en': return enUS
      default: return uk
    }
  }

  const daysRemaining = goal.deadline
    ? differenceInDays(new Date(goal.deadline), new Date())
    : null

  const monthlyNeeded = goal.deadline && daysRemaining && daysRemaining > 0
    ? remaining / (daysRemaining / 30)
    : 0

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '2px solid',
        borderColor: mode === 'dark'
          ? progress >= 100 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'
          : progress >= 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
        background: mode === 'dark'
          ? progress >= 100
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          : progress >= 100
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(5, 150, 105, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: mode === 'dark'
            ? progress >= 100 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(99, 102, 241, 0.5)'
            : progress >= 100 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)',
          transform: 'translateY(-4px)',
          boxShadow: mode === 'dark'
            ? '0 8px 16px rgba(99, 102, 241, 0.2)'
            : '0 8px 16px rgba(99, 102, 241, 0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
            {goal.title}
          </Typography>
          <Box>
            <IconButton size="small" color="primary" onClick={onEdit}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={onDelete}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('goals.progress')}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: progress >= 100
                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              },
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('goals.saved')}: <strong>{formatCurrency(goal.currentAmount, currency)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('goals.target')}: <strong>{formatCurrency(goal.targetAmount, currency)}</strong>
          </Typography>
          {remaining > 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('goals.remaining')}: <strong>{formatCurrency(remaining, currency)}</strong>
            </Typography>
          )}
        </Box>

        {goal.deadline && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${t('goals.deadline')}: ${format(new Date(goal.deadline), 'dd MMM yyyy', { locale: getDateLocale() })}`}
              size="small"
              color={daysRemaining && daysRemaining < 30 ? 'warning' : 'default'}
              sx={{ mr: 1 }}
            />
            {daysRemaining !== null && daysRemaining > 0 && (
              <Chip
                label={`${daysRemaining} ${t('goals.daysLeft')}`}
                size="small"
                color={daysRemaining < 30 ? 'error' : 'default'}
              />
            )}
          </Box>
        )}

        {monthlyNeeded > 0 && remaining > 0 && (
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            {t('goals.monthlyNeeded')}: <strong>{formatCurrency(monthlyNeeded, currency)}</strong>
          </Typography>
        )}

        {progress >= 100 && (
          <Chip
            label={t('goals.completed')}
            color="success"
            sx={{ mb: 2 }}
          />
        )}

        {progress < 100 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            fullWidth
            onClick={onAddProgress}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            {t('goals.addProgress')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
