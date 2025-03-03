import { useState, useEffect } from 'react';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCache from '@emotion/cache';
import { Box, Container, Typography, Link, IconButton, useMediaQuery, Snackbar, Alert } from '@mui/material';
import Head from 'next/head';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useRouter } from 'next/router';

// Emotion cache oluştur
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

// Client-side cache
const clientSideEmotionCache = createEmotionCache();

// Cyberpunk tema renkleri ve stilleri
const createCyberpunkTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#00f2fe',
      light: '#4facfe',
      dark: '#0088cc',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ff4b4b',
      light: '#ff7676',
      dark: '#cc2c2c',
      contrastText: '#ffffff'
    },
    background: {
      default: mode === 'dark' ? '#0a0a0f' : '#1a1a2e',
      paper: mode === 'dark' ? '#151515' : '#1e1e2e',
    },
    text: {
      primary: mode === 'dark' ? '#ffffff' : '#ffffff',
      secondary: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: [
      'BlenderPro',
      'Rajdhani',
      'Orbitron',
      'Roboto',
      'sans-serif'
    ].join(','),
    h1: {
      fontFamily: 'Orbitron',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 0 20px rgba(0, 242, 254, 0.5)',
    },
    h2: {
      fontFamily: 'Orbitron',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    h3: {
      fontFamily: 'Rajdhani',
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h4: {
      fontFamily: 'Rajdhani',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Rajdhani',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'Rajdhani',
      fontWeight: 500,
    },
    button: {
      fontFamily: 'Rajdhani',
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': [
          {
            fontFamily: 'Orbitron',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 400,
            src: `url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap')`,
          },
          {
            fontFamily: 'Rajdhani',
            fontStyle: 'normal',
            fontDisplay: 'swap',
            fontWeight: 400,
            src: `url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap')`,
          },
        ],
        body: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)' 
            : 'linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)',
          color: '#ffffff',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.2)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(20, 20, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(79, 172, 254, 0.1)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.05em',
          background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1))',
          border: '1px solid rgba(79, 172, 254, 0.2)',
          '&:hover': {
            background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
          color: '#ffffff',
          border: 'none',
          '&:hover': {
            background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#4facfe',
          '&:hover': {
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(79, 172, 254, 0.1)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)',
            border: '1px solid rgba(79, 172, 254, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 20, 30, 0.8)',
          border: '1px solid rgba(79, 172, 254, 0.2)',
          color: '#4facfe',
          '&:hover': {
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
          },
        },
        icon: {
          color: 'inherit',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(79, 172, 254, 0.1)',
        },
      },
    },
  },
});

// Footer bileşeni
const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(79, 172, 254, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body2" 
          align="center"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '& a': {
              color: '#4facfe',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                textShadow: '0 0 10px rgba(79, 172, 254, 0.5)',
              },
            },
          }}
        >
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <Link color="inherit" href="/">
            Türkiye'de Geçmiş Olayları Sorgulama Sistemi
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

// Navbar bileşeni
const Navbar = ({ toggleColorMode, mode }) => {
  const router = useRouter();
  
  return (
    <Box
      component="nav"
      sx={{
        py: 2,
        px: 2,
        backgroundColor: 'rgba(20, 20, 30, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(79, 172, 254, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontFamily: 'Orbitron',
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 10px rgba(79, 172, 254, 0.5)',
              letterSpacing: '0.05em',
            }}
            onClick={() => router.push('/')}
          >
            <Box component="span" sx={{ mr: 1, display: { xs: 'none', sm: 'inline' } }}>
              TARİH
            </Box>
            <Box component="span">Sorgulama</Box>
          </Typography>
          
          <Box>
            <IconButton 
              onClick={toggleColorMode} 
              sx={{
                color: '#4facfe',
                '&:hover': {
                  backgroundColor: 'rgba(79, 172, 254, 0.1)',
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
                },
              }}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState('light');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Sistem tercihine göre başlangıç temasını ayarla
  useEffect(() => {
    const savedMode = localStorage.getItem('colorMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);
  
  // Tema değiştirme işlevi
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('colorMode', newMode);
    setSnackbar({ 
      open: true, 
      message: `${newMode === 'dark' ? 'Karanlık' : 'Aydınlık'} tema etkinleştirildi`, 
      severity: 'success' 
    });
  };
  
  // Snackbar kapatma işlevi
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Tema oluştur
  const theme = createCyberpunkTheme(mode);
  
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <Navbar toggleColorMode={toggleColorMode} mode={mode} />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Component {...pageProps} />
          </Box>
          <Footer />
        </Box>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </CacheProvider>
  );
} 