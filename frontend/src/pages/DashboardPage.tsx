import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material'
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import api from '../services/api'
import { useThemeStore } from '../store/themeStore'
import { formatCurrency } from '../utils/currency'
import Header from '../components/Header'
import AIInsights from '../components/AIInsights'
import AIPredictions from '../components/AIPredictions'
import { useTranslation } from 'react-i18next'

interface Analytics {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
  }
  categoryData: Array<{ name: string; value: number }>
  monthlyData: Array<{ month: string; income: number; expense: number }>
  topExpenses: Array<any>
  comparison: {
    currentMonth: number
    previousMonth: number
    changePercent: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

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

export default function DashboardPage() {
  const { mode, currency } = useThemeStore()
  const { t } = useTranslation()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: { xs: 2, md: 4 }
          }}
        >
          {t('dashboard.title')}
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'dark'
                    ? '0 8px 16px rgba(16, 185, 129, 0.2)'
                    : '0 8px 16px rgba(16, 185, 129, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <TrendingUp sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {t('dashboard.income')}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {formatCurrency(analytics?.summary.totalIncome ?? 0, currency)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.4)',
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'dark'
                    ? '0 8px 16px rgba(239, 68, 68, 0.2)'
                    : '0 8px 16px rgba(239, 68, 68, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <TrendingDown sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {t('dashboard.expenses')}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {formatCurrency(analytics?.summary.totalExpense ?? 0, currency)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                    }}
                  >
                    <AccountBalance sx={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {t('dashboard.balance')}
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color={(analytics?.summary.balance ?? 0) >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(analytics?.summary.balance ?? 0, currency)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
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
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('dashboard.expensesByCategory')}
                </Typography>
                {analytics && analytics.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${t(`transactions.categories.${getCategoryKey(name)}`)} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.categoryData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [value, t(`transactions.categories.${getCategoryKey(name as string)}`)]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                    {t('common.noData')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
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
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('dashboard.monthlyTrend')}
                </Typography>
                {analytics && analytics.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => t(`months.${value}`)}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => t(`months.${value}`)}
                      />
                      <Legend />
                      <Bar dataKey="income" fill="#10b981" name={t('dashboard.income')} />
                      <Bar dataKey="expense" fill="#ef4444" name={t('dashboard.expenses')} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                    {t('common.noData')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Comparison Card */}
          <Grid item xs={12} md={6}>
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
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('dashboard.comparison')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('dashboard.currentMonth')}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(analytics?.comparison.currentMonth ?? 0, currency)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('dashboard.previousMonth')}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(analytics?.comparison.previousMonth ?? 0, currency)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('dashboard.change')}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color={(analytics?.comparison?.changePercent ?? 0) > 0 ? 'error.main' : 'success.main'}
                    >
                      {(analytics?.comparison?.changePercent ?? 0) > 0 ? '+' : ''}
                      {analytics?.comparison?.changePercent ?? 0}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top 5 Expenses */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.02) 0%, rgba(220, 38, 38, 0.02) 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.4)',
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'dark'
                    ? '0 8px 16px rgba(239, 68, 68, 0.2)'
                    : '0 8px 16px rgba(239, 68, 68, 0.15)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {t('dashboard.topExpenses')}
                </Typography>
                {analytics && analytics.topExpenses.length > 0 ? (
                  <Box>
                    {analytics.topExpenses.map((expense, index) => (
                      <Box
                        key={expense.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1.5,
                          borderBottom: index < analytics.topExpenses.length - 1 ? '1px solid' : 'none',
                          borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'error.main',
                                color: 'white',
                                fontSize: '0.75rem',
                              }}
                            >
                              {index + 1}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {t(`transactions.categories.${getCategoryKey(expense.category)}`)}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {expense.description || '-'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="error.main">
                          {formatCurrency(expense.amount, currency)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                    {t('common.noData')}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* AI Insights & Predictions */}
          <Grid item xs={12} md={6}>
            <AIInsights />
          </Grid>

          <Grid item xs={12} md={6}>
            <AIPredictions />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
