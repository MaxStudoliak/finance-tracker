import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../store/themeStore'
import Header from '../components/Header'
import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'
import AddProgressDialog from '../components/AddProgressDialog'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import api from '../services/api'

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
}

export default function GoalsPage() {
  const { t } = useTranslation()
  const { mode } = useThemeStore()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null)

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals')
      setGoals(response.data.goals || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleDeleteClick = (id: string) => {
    setDeletingGoalId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingGoalId) return

    try {
      await api.delete(`/goals/${deletingGoalId}`)
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      alert(t('common.error'))
    } finally {
      setDeletingGoalId(null)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormOpen(true)
  }

  const handleAddProgress = (goal: Goal) => {
    setSelectedGoal(goal)
    setProgressDialogOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingGoal(null)
  }

  const handleFormSuccess = () => {
    fetchGoals()
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: { xs: 2, md: 4 },
          gap: 2
        }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('goals.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            fullWidth={{ xs: true, sm: false }}
            sx={{
              minHeight: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            {t('goals.addNew')}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : goals.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 3,
              border: '2px dashed',
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('goals.noGoals')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('goals.addFirst')}
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
              {t('goals.addNew')}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {goals.map((goal) => (
              <Grid item xs={12} md={6} lg={4} key={goal.id}>
                <GoalCard
                  goal={goal}
                  onEdit={() => handleEdit(goal)}
                  onDelete={() => handleDeleteClick(goal.id)}
                  onAddProgress={() => handleAddProgress(goal)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <GoalForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        goal={editingGoal}
      />

      {selectedGoal && (
        <AddProgressDialog
          open={progressDialogOpen}
          onClose={() => {
            setProgressDialogOpen(false)
            setSelectedGoal(null)
          }}
          onSuccess={handleFormSuccess}
          goalId={selectedGoal.id}
          goalTitle={selectedGoal.title}
        />
      )}

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingGoalId(null)
        }}
        onConfirm={handleDeleteConfirm}
        message={t('goals.deleteConfirm')}
      />
    </Box>
  )
}
