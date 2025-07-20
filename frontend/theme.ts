'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // uses dark background/text by default
    primary: {
      main: '#660033',    // your #1 color: burgundy
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#000000',    // black as secondary
      contrastText: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    info: {
      main: '#1976d2',    // MUI default blue, you can adjust
    },
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
  },
  shape: {
    borderRadius: 12, // MD3-style roundness
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#111111',
        },
      },
    },
  },
});

export default theme;