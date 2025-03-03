import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Fade,
  Zoom,
  Grow,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import { getCategories, getYears } from '../services/api';
import TimelineSlider from '../components/TimelineSlider';
import CategoryCards from '../components/CategoryCards';
import FeaturedEvents from '../components/FeaturedEvents';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';

// Hero bölümü için özel stil
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100vh',
  minHeight: 600,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 30, 0.95))',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/hero-background.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.2,
    zIndex: 0,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  maxWidth: 800,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1))',
    borderRadius: theme.shape.borderRadius * 2,
    filter: 'blur(20px)',
    zIndex: -1,
  },
}));

const ScrollDownButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  color: '#4facfe',
  border: '1px solid rgba(79, 172, 254, 0.2)',
  backdropFilter: 'blur(4px)',
  background: 'rgba(20, 20, 30, 0.8)',
  animation: 'bounce 2s infinite',
  '&:hover': {
    background: 'rgba(79, 172, 254, 0.1)',
    boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
  },
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateX(-50%) translateY(0)',
    },
    '40%': {
      transform: 'translateX(-50%) translateY(-20px)',
    },
    '60%': {
      transform: 'translateX(-50%) translateY(-10px)',
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  fontFamily: 'Orbitron',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: theme.spacing(6),
  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 20px rgba(0, 242, 254, 0.5)',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -10,
    left: 0,
    width: '100%',
    height: 2,
    background: 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)',
    animation: 'glow 3s linear infinite',
  },
  '@keyframes glow': {
    '0%': {
      backgroundPosition: '-200% 0',
    },
    '100%': {
      backgroundPosition: '200% 0',
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.1)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)',
    border: '1px solid rgba(79, 172, 254, 0.3)',
    transform: 'translateY(-5px)',
  },
}));

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kategorileri ve yılları paralel olarak getir
        const [categoriesData, yearsData] = await Promise.all([
          getCategories(),
          getYears()
        ]);
        
        setCategories(categoriesData);
        setYears(yearsData);
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError(error.message || 'Veriler yüklenirken bir hata oluştu.');
        setLoading(false);
        
        // Hata durumunda snackbar göster
        setSnackbar({
          open: true,
          message: error.message || 'Veriler yüklenirken bir hata oluştu.',
          severity: 'error'
        });
      }
    };
    
    fetchData();
  }, []);
  
  // Yıl değiştiğinde işlem yap
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };
  
  // İçeriğe kaydır
  const scrollToContent = () => {
    const contentElement = document.getElementById('content-section');
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <>
      <Head>
        <title>Türkiye'de Geçmiş Olayları Sorgulama Sistemi</title>
        <meta name="description" content="Türkiye'de geçmişte yaşanan önemli olayları yıl ve kategori bazında sorgulayın." />
      </Head>
      
      {/* Hero Bölümü */}
      <HeroSection>
        <HeroContent>
          <Fade in={true} timeout={1000}>
            <Box>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  fontFamily: 'Orbitron',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(0, 242, 254, 0.5)',
                }}
              >
                Geçmişe Yolculuk
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  maxWidth: 600, 
                  mx: 'auto', 
                  mb: 4,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'Rajdhani',
                  letterSpacing: '0.05em',
                }}
              >
                Türkiye'nin tarihindeki önemli olayları keşfedin, yıl ve kategori bazında sorgulayın.
              </Typography>
              
              <Button 
                variant="contained" 
                size="large"
                onClick={scrollToContent}
                sx={{ 
                  px: 4, 
                  py: 2,
                  fontSize: '1.2rem',
                  fontFamily: 'Rajdhani',
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                    boxShadow: '0 0 30px rgba(0, 242, 254, 0.5)',
                  },
                }}
              >
                Keşfetmeye Başla
              </Button>
            </Box>
          </Fade>
        </HeroContent>
        
        <ScrollDownButton 
          onClick={scrollToContent}
          aria-label="Aşağı kaydır"
        >
          <KeyboardArrowDownIcon fontSize="large" />
        </ScrollDownButton>
      </HeroSection>
      
      {/* Ana İçerik */}
      <Container maxWidth="lg" id="content-section">
        <Box sx={{ py: 8 }}>
          <TimelineSlider 
            onYearChange={handleYearChange} 
            initialYear={years && years.length > 0 ? years[0] : new Date().getFullYear()}
          />
          
          <Box sx={{ mt: 12 }}>
            <SectionTitle variant="h4" component="h2">
              Kategoriler
            </SectionTitle>
            <CategoryCards 
              categories={categories} 
              selectedYear={selectedYear} 
              loading={loading}
            />
          </Box>
          
          <Box sx={{ mt: 12 }}>
            <SectionTitle variant="h4" component="h2">
              Öne Çıkan Olaylar
            </SectionTitle>
            <FeaturedEvents loading={loading} />
          </Box>
          
          <Box sx={{ mt: 12 }}>
            <StyledPaper>
              <SectionTitle variant="h4" component="h2">
                Nasıl Kullanılır?
              </SectionTitle>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1))',
                          border: '1px solid rgba(79, 172, 254, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 20px',
                          color: '#4facfe',
                        }}
                      >
                        <Typography variant="h4" fontFamily="Orbitron">1</Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom fontFamily="Rajdhani" fontWeight="bold">
                        Yıl Seçin
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tarih tünelinden bir yıl seçerek başlayın
                      </Typography>
                    </Box>
                  </Zoom>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1))',
                          border: '1px solid rgba(79, 172, 254, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 20px',
                          color: '#4facfe',
                        }}
                      >
                        <Typography variant="h4" fontFamily="Orbitron">2</Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom fontFamily="Rajdhani" fontWeight="bold">
                        Kategori Seçin
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        İlgilendiğiniz kategoriyi seçin
                      </Typography>
                    </Box>
                  </Zoom>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Zoom in={true} style={{ transitionDelay: '600ms' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1))',
                          border: '1px solid rgba(79, 172, 254, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 20px',
                          color: '#4facfe',
                        }}
                      >
                        <Typography variant="h4" fontFamily="Orbitron">3</Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom fontFamily="Rajdhani" fontWeight="bold">
                        Olayları İnceleyin
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Seçtiğiniz dönemdeki olayları keşfedin
                      </Typography>
                    </Box>
                  </Zoom>
                </Grid>
              </Grid>
            </StyledPaper>
          </Box>
        </Box>
      </Container>
      
      {/* Hata Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            backdropFilter: 'blur(8px)',
            background: 'rgba(20, 20, 30, 0.9)',
            border: '1px solid rgba(79, 172, 254, 0.2)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 