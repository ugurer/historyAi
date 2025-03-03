import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button, 
  Chip,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Fade,
  Zoom,
  Slide,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Skeleton,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Breadcrumbs,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getYearlySummary, getEvents } from '../../../services/api';
import Head from 'next/head';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TimelineIcon from '@mui/icons-material/Timeline';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { 
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TabPanel
} from '@mui/lab';

// Kategori sayfası için iskelet (skeleton) bileşeni
const CategoryPageSkeleton = () => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <LinearProgress color="primary" />
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" my={8}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary" mt={2}>
          Veriler yükleniyor...
        </Typography>
      </Box>
    </Box>
  );
};

// Tab erişilebilirlik özellikleri için yardımcı fonksiyon
const a11yProps = (index) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

// Özet bileşeni
const Summary = ({ summary, source, year, category }) => {
  const summarySourceLabel = 
    source === 'ai' ? 'AI Tarafından Oluşturuldu' : 
    source === 'cache' ? 'Önbellekten Alındı' : 
    'Veritabanından Alındı';
    
  const summarySourceColor =
    source === 'ai' ? 'primary' : 
    source === 'cache' ? 'success' : 
    'warning';
    
  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary">
        {year} Yılı {category} Özeti
      </Typography>
      
      <Chip 
        label={summarySourceLabel} 
        size="small" 
        color={summarySourceColor}
        sx={{ mb: 3 }}
      />
      
      <Box sx={{ 
        typography: 'body1', 
        lineHeight: 1.7,
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}>
        <ReactMarkdown>{summary}</ReactMarkdown>
      </Box>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>Bilgi</AlertTitle>
        Bu özet, yapay zeka teknolojisi kullanılarak oluşturulmuştur. İçeriğin doğruluğunu farklı kaynaklardan teyit etmenizi öneririz.
      </Alert>
    </Box>
  );
};

// Olaylar listesi bileşeni
const EventsList = ({ events, year, category }) => {
  const theme = useTheme();
  const [hoveredEvent, setHoveredEvent] = useState(null);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary">
        {year} Yılı {category} Olayları
      </Typography>
      
      <Grid container spacing={3}>
        {events.map((event, index) => (
          <Grid item xs={12} md={6} key={event.id || index}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  transform: hoveredEvent === event.id ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredEvent === event.id ? 4 : 1,
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '5px',
                    height: '100%',
                    backgroundColor: getCategoryColor(category, theme)
                  }
                }}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                <CardActionArea 
                  component={Link}
                  href={`/event/${event.event_date}/${encodeURIComponent(event.event_title)}`}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <CardContent sx={{ width: '100%', flexGrow: 1 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {formatDate(event.event_date)}
                    </Typography>
                    
                    <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                      {event.event_title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Chip 
                        label={category} 
                        size="small" 
                        sx={{ 
                          backgroundColor: getCategoryColor(category, theme),
                          color: '#fff'
                        }} 
                      />
                      
                      <Chip 
                        label={`Önem: ${event.importance}/5`} 
                        size="small" 
                        color={
                          event.importance >= 5 ? 'error' :
                          event.importance >= 4 ? 'warning' :
                          event.importance >= 3 ? 'info' :
                          'success'
                        }
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Özel stil bileşenleri
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.98))',
  padding: theme.spacing(4, 0),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6, 3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.1)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)',
    animation: 'glow 3s linear infinite',
  },
  '@keyframes glow': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  '& .MuiBreadcrumbs-li': {
    display: 'flex',
    alignItems: 'center',
    color: '#4facfe',
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      '&:hover': {
        textShadow: '0 0 10px rgba(79, 172, 254, 0.5)',
      },
    },
  },
}));

const ContentCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.1)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)',
    border: '1px solid rgba(79, 172, 254, 0.3)',
  },
}));

const EventCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)',
    border: '1px solid rgba(79, 172, 254, 0.4)',
  },
}));

const StyledChip = styled(Chip)(({ theme, importance }) => ({
  backgroundColor: 'transparent',
  border: `1px solid ${importance === 'high' ? '#ff4b4b' : '#4facfe'}`,
  color: importance === 'high' ? '#ff4b4b' : '#4facfe',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
  '&:hover': {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.1))',
  border: '1px solid rgba(79, 172, 254, 0.2)',
  color: '#4facfe',
  backdropFilter: 'blur(4px)',
  '&:hover': {
    background: 'linear-gradient(45deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.2))',
    boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Orbitron',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 20px rgba(0, 242, 254, 0.5)',
  marginBottom: theme.spacing(3),
}));

// Kategori rengini belirle
const getCategoryColor = (category, theme) => {
  switch (category) {
    case 'Siyasi': return theme.palette.mode === 'dark' ? '#3f51b5' : '#3f51b5';
    case 'Ekonomik': return theme.palette.mode === 'dark' ? '#2e7d32' : '#2e7d32';
    case 'Sosyal': return theme.palette.mode === 'dark' ? '#f57c00' : '#f57c00';
    case 'Doğal Afet': return theme.palette.mode === 'dark' ? '#d32f2f' : '#d32f2f';
    case 'Spor': return theme.palette.mode === 'dark' ? '#1976d2' : '#1976d2';
    case 'Kültür-Sanat': return theme.palette.mode === 'dark' ? '#9c27b0' : '#9c27b0';
    case 'Bilim-Teknoloji': return theme.palette.mode === 'dark' ? '#0288d1' : '#0288d1';
    default: return theme.palette.primary.main;
  }
};

// Kategori ikonunu belirle
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Siyasi': return <InfoIcon />;
    case 'Ekonomik': return <TimelineIcon />;
    case 'Sosyal': return <CategoryIcon />;
    case 'Doğal Afet': return <ErrorOutlineIcon />;
    case 'Spor': return <TimelineIcon />;
    case 'Kültür-Sanat': return <CategoryIcon />;
    case 'Bilim-Teknoloji': return <InfoIcon />;
    default: return <EventIcon />;
  }
};

// TabPanel bileşenini tanımla
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{ mt: 3 }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </Box>
  );
}

export default function CategoryPage() {
  const router = useRouter();
  const { year, category } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [summary, setSummary] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summarySource, setSummarySource] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const fetchData = async () => {
    if (!year || !category) return;
    
    try {
      setLoading(true);
      setError(null);
      setIsRetrying(false);
      
      console.log(`Veriler getiriliyor: Yıl=${year}, Kategori=${category}`);
      
      // Önce kategori ve yıl geçerliliğini kontrol et
      try {
        // Yıl ve kategori bazlı özet ve olayları getir
        const [summaryData, eventsData] = await Promise.all([
          getYearlySummary(year, category),
          getEvents(year, category)
        ]);
        
        console.log('Alınan özet:', summaryData);
        console.log('Alınan olaylar:', eventsData);
        console.log('Alınan olayların sayısı:', Array.isArray(eventsData) ? eventsData.length : 'Dizi değil');
        
        setSummary(summaryData.summary);
        setSummarySource(summaryData.source);
        
        // Olayların dizi olduğundan emin ol
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        } else {
          console.error('Olaylar dizi formatında değil:', eventsData);
          setEvents([]);
        }
      } catch (apiError) {
        console.error('API çağrısı hatası:', apiError);
        setError(apiError.message || 'Veriler yüklenirken bir hata oluştu.');
        setSummary('');
        setEvents([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setError(error.message || 'Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Sayfa yüklendiğinde yer imi durumunu kontrol et
    const checkBookmark = () => {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      const isBookmarked = bookmarks.some(
        bookmark => bookmark.year === year && bookmark.category === category
      );
      setBookmarked(isBookmarked);
    };
    
    if (year && category) {
      checkBookmark();
    }
  }, [year, category]);

  // Yeniden deneme işlevi
  const handleRetry = () => {
    setIsRetrying(true);
    fetchData();
  };

  // Tab değişikliğini işle
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Yer imi işlevi
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    if (bookmarked) {
      // Yer imini kaldır
      const updatedBookmarks = bookmarks.filter(
        bookmark => !(bookmark.year === year && bookmark.category === category)
      );
      localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      setBookmarked(false);
    } else {
      // Yer imi ekle
      bookmarks.push({
        year,
        category,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setBookmarked(true);
    }
  };

  // Paylaşım işlevi
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${year} - ${category} | Türkiye'de Geçmiş Olayları Sorgulama Sistemi`,
        text: `${year} yılında Türkiye'de ${category} alanında yaşanan olaylar`,
        url: window.location.href,
      })
      .catch((error) => console.log('Paylaşım hatası:', error));
    } else {
      // Paylaşım API'si desteklenmiyorsa URL'yi panoya kopyala
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Sayfa bağlantısı panoya kopyalandı!');
        })
        .catch((error) => {
          console.error('Panoya kopyalama hatası:', error);
        });
    }
  };

  // Sayfa içeriğini oluştur
  const renderContent = () => {
    if (loading) {
      return <CategoryPageSkeleton />;
    }
    
    if (error) {
      return (
        <ContentCard>
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <ErrorOutlineIcon sx={{ fontSize: 60, color: '#ff4b4b', mb: 2 }} />
            <Typography color="error" align="center" gutterBottom variant="h6" fontFamily="Rajdhani">
              Hata Oluştu
            </Typography>
            <Typography color="text.secondary" align="center" paragraph>
              {error}
            </Typography>
            <ActionButton
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{ mt: 2 }}
            >
              Yeniden Dene
            </ActionButton>
          </Box>
        </ContentCard>
      );
    }
    
    return (
      <>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="Kategori sekmeler"
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{ 
            mb: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: isMobile ? '0.85rem' : '1rem'
            }
          }}
        >
          <Tab label="Yıl Özeti" {...a11yProps(0)} />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span">Olaylar</Typography>
                {events.length > 0 && (
                  <Chip 
                    label={events.length} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} 
                  />
                )}
              </Box>
            } 
            {...a11yProps(1)} 
          />
        </Tabs>

        <CustomTabPanel value={tabValue} index={0}>
          <Summary 
            summary={summary} 
            source={summarySource}
            year={year}
            category={category}
          />
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={1}>
          {events.length > 0 ? (
            <EventsList 
              events={events} 
              year={year}
              category={category}
            />
          ) : (
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <SearchOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="text.secondary">
                Olay Bulunamadı
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {year} yılında {category} kategorisinde kayıtlı olay bulunmamaktadır.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                AI tarafından oluşturulan özete göz atabilir veya farklı bir yıl ya da kategori seçebilirsiniz.
              </Typography>
              {tabValue === 1 && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => setTabValue(0)} 
                  sx={{ mt: 2 }}
                >
                  Yıl Özetine Bak
                </Button>
              )}
            </Box>
          )}
        </CustomTabPanel>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>{`${year} - ${category} | Türkiye'de Geçmiş Olayları Sorgulama Sistemi`}</title>
        <meta name="description" content={`${year} yılında Türkiye'de ${category} alanında yaşanan olaylar`} />
      </Head>

      <PageContainer>
        <Container maxWidth="lg">
          <StyledBreadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link href="/" passHref>
              <Box component="a" sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                Ana Sayfa
              </Box>
            </Link>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimelineIcon sx={{ mr: 0.5 }} fontSize="small" />
              {year}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CategoryIcon sx={{ mr: 0.5 }} fontSize="small" />
              {category}
            </Box>
          </StyledBreadcrumbs>

          <PageHeader>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <SectionTitle variant="h4" component="h1">
                  {year} Yılı {category} Olayları
                </SectionTitle>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={toggleBookmark}
                    sx={{
                      color: bookmarked ? '#4facfe' : 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                      },
                    }}
                  >
                    {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>

                  <IconButton
                    onClick={handleShare}
                    sx={{
                      color: '#4facfe',
                      '&:hover': {
                        backgroundColor: 'rgba(79, 172, 254, 0.1)',
                      },
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>

              <ActionButton
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/')}
                size="small"
              >
                Ana Sayfaya Dön
              </ActionButton>
            </Box>
          </PageHeader>

          {renderContent()}
        </Container>
      </PageContainer>
    </>
  );
} 