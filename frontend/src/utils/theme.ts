import { createTheme, PaletteMode } from '@mui/material/styles'

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ec4899',
        light: '#f472b6',
        dark: '#db2777',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      info: {
        main: '#06b6d4',
        light: '#22d3ee',
        dark: '#0891b2',
      },
      background: {
        default: mode === 'dark' ? '#0a0a0f' : '#f8fafc',
        paper: mode === 'dark' ? '#14141f' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e4e4e7' : '#1a202c',
        secondary: mode === 'dark' ? '#a1a1aa' : '#718096',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 800,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 700,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      mode === 'dark'
        ? '0px 2px 8px rgba(99, 102, 241, 0.15)'
        : '0px 2px 4px rgba(0,0,0,0.05)',
      mode === 'dark'
        ? '0px 4px 12px rgba(99, 102, 241, 0.2)'
        : '0px 4px 8px rgba(0,0,0,0.05)',
      mode === 'dark'
        ? '0px 8px 20px rgba(99, 102, 241, 0.25)'
        : '0px 8px 16px rgba(0,0,0,0.08)',
      mode === 'dark'
        ? '0px 12px 28px rgba(99, 102, 241, 0.3)'
        : '0px 12px 24px rgba(0,0,0,0.1)',
      mode === 'dark'
        ? '0px 16px 36px rgba(99, 102, 241, 0.35)'
        : '0px 16px 32px rgba(0,0,0,0.12)',
      mode === 'dark'
        ? '0px 20px 44px rgba(99, 102, 241, 0.4)'
        : '0px 20px 40px rgba(0,0,0,0.14)',
      mode === 'dark'
        ? '0px 24px 52px rgba(99, 102, 241, 0.45)'
        : '0px 24px 48px rgba(0,0,0,0.16)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
      '0px 2px 4px rgba(0,0,0,0.05)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
          },
          contained: {
            boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.25)',
            '&:hover': {
              boxShadow: '0px 6px 16px rgba(99, 102, 241, 0.35)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === 'dark'
                ? '0px 4px 20px rgba(99, 102, 241, 0.2)'
                : '0px 4px 16px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            border: mode === 'dark' ? '1px solid rgba(99, 102, 241, 0.1)' : 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow:
                mode === 'dark'
                  ? '0px 12px 32px rgba(99, 102, 241, 0.35)'
                  : '0px 12px 24px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: mode === 'dark' ? '1px solid rgba(99, 102, 241, 0.08)' : 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  })
