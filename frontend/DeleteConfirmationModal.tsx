import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slide,
  IconButton
} from '@mui/material'
import { Warning, Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { TransitionProps } from '@mui/material/transitions'
import { forwardRef } from 'react'
import { useThemeStore } from '../store/themeStore'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface DeleteConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message
}: DeleteConfirmationModalProps) {
  const { t } = useTranslation()
  const { mode } = useThemeStore()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(20, 20, 30, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 250, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: mode === 'dark' ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(220, 38, 38, 0.4)',
          boxShadow: mode === 'dark'
            ? '0 12px 40px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.1)'
            : '0 12px 40px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                    opacity: 0.9,
                  },
                },
              }}
            >
              <Warning sx={{ fontSize: 28, color: 'error.main' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="error.main">
              {title || t('common.delete')}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                background: 'rgba(239, 68, 68, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {message || t('transactions.deleteConfirm')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              background: 'rgba(99, 102, 241, 0.05)',
            },
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          variant="contained"
          fullWidth
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
