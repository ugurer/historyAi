import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Button, 
  Chip,
  Divider,
  Card,
  CardContent,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  AlertTitle,
  Breadcrumbs,
  LinearProgress,
  Grid,
  Avatar,
  List,
  ListItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getEventDetail } from '../../../services/api';
import { 
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';

// İkonlar
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CategoryIcon from '@mui/icons-material/Category';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import UpdateIcon from '@mui/icons-material/Update';

// Markdown
import ReactMarkdown from 'react-markdown';

// Özel Stil Bileşenleri
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.98))',
  padding: theme.spacing(4, 0),
}));

const StyledPageHeader = styled(Box)(({ theme }) => ({
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

const StyledContentCard = styled(Paper)(({ theme }) => ({
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

const StyledDetailContainer = styled(Box)(({ theme, source }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: source === 'ai' 
      ? 'linear-gradient(90deg, transparent, #ff4b4b, #ff7676, transparent)'
      : 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)',
    animation: 'glow 3s linear infinite',
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

const StyledTimelineItem = styled(Box)(({ theme, color = '#4facfe' }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: 'rgba(20, 20, 30, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${color}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 0 20px ${color}33`,
    transform: 'translateX(8px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -20,
    top: '50%',
    width: 40,
    height: 2,
    background: `linear-gradient(90deg, transparent, ${color}, ${color}, transparent)`,
  },
}));

const RelatedEventCard = styled(Card)(({ theme }) => ({
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

// Yardımcı Fonksiyonlar
const getCategoryColor = (category, theme) => {
  const colors = {
    'Siyasi': '#3f51b5',
    'Ekonomik': '#2e7d32',
    'Sosyal': '#f57c00',
    'Doğal Afet': '#d32f2f',
    'Spor': '#1976d2',
    'Kültür-Sanat': '#9c27b0',
    'Bilim-Teknoloji': '#0288d1'
  };
  return colors[category] || theme.palette.primary.main;
};

const getCategoryIcon = (category) => {
  const icons = {
    'Siyasi': <HistoryEduIcon />,
    'Ekonomik': <TimelineIcon />,
    'Sosyal': <CategoryIcon />,
    'Doğal Afet': <ErrorOutlineIcon />,
    'Spor': <TimelineIcon />,
    'Kültür-Sanat': <CategoryIcon />,
    'Bilim-Teknoloji': <InfoIcon />
  };
  return icons[category] || <EventIcon />;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// generateEventTimeline fonksiyonunu ekleyelim
const generateEventTimeline = async (eventDate, eventTitle, eventDetail) => {
  // Olayın tarihini parçala
  const date = new Date(eventDate);
  const year = date.getFullYear();

  // Olayın öncesi, sırası ve sonrası için bilgileri ayır
  const timelineItems = [
    {
      id: 1,
      title: 'Olay Öncesi',
      date: `${year} Öncesi`,
      content: 'Olayın öncesindeki gelişmeler ve nedenler',
      icon: <HistoryEduIcon />,
      color: '#4facfe'
    },
    {
      id: 2,
      title: 'Olay Tarihi',
      date: formatDate(eventDate),
      content: eventTitle,
      icon: <EventIcon />,
      color: '#ff4b4b'
    },
    {
      id: 3,
      title: 'Sonrası',
      date: `${year} Sonrası`,
      content: 'Olayın etkileri ve sonuçları',
      icon: <TimelineIcon />,
      color: '#4facfe'
    },
    {
      id: 4,
      title: 'Günümüz',
      date: 'Günümüz',
      content: 'Olayın günümüze yansımaları',
      icon: <UpdateIcon />,
      color: '#4facfe'
    }
  ];

  return timelineItems;
};

// Ana Bileşen
export default function EventDetailPage() {
  const router = useRouter();
  const { date, title } = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
    defaultMatches: true,
    noSsr: true
  });
  
  const [eventDetail, setEventDetail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailSource, setDetailSource] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [eventCategory, setEventCategory] = useState('Doğal Afet');
  const [isClient, setIsClient] = useState(false);
  const [timelineItems, setTimelineItems] = useState([]);

  // İlgili olaylar (örnek veri)
  const relatedEvents = [
    {
      id: 1,
      date: '1999-08-17',
      title: 'Marmara Depremi',
      category: 'Doğal Afet'
    },
    {
      id: 2,
      date: '2020-01-24',
      title: 'Elazığ Depremi',
      category: 'Doğal Afet'
    },
    {
      id: 3,
      date: '2023-02-06',
      title: 'Kahramanmaraş Depremi',
      category: 'Doğal Afet'
    }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRetrying(false);
        
        const detailData = await getEventDetail(date, title);
        setEventDetail(detailData.detail);
        setDetailSource(detailData.source);
        
        // Kategoriyi belirle
        if (title.includes('Deprem')) {
          setEventCategory('Doğal Afet');
        } else if (title.includes('Seçim') || title.includes('Darbe')) {
          setEventCategory('Siyasi');
        } else if (title.includes('Kriz')) {
          setEventCategory('Ekonomik');
        } else {
          setEventCategory('Sosyal');
        }

        // Zaman çizelgesi öğelerini oluştur
        const timeline = await generateEventTimeline(date, title, detailData.detail);
        setTimelineItems(timeline);
        
        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError(error.message || 'Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
        setLoading(false);
      }
    };
    
    if (date && title) {
      fetchData();
    }
  }, [date, title, isClient]);

  const handleRetry = () => {
    setIsRetrying(true);
    fetchData();
  };

  const handleBookmark = () => {
    if (!isClient) return;

    const bookmarks = JSON.parse(localStorage.getItem('eventBookmarks') || '[]');
    
    if (bookmarked) {
      const updatedBookmarks = bookmarks.filter(
        bookmark => !(bookmark.date === date && bookmark.title === title)
      );
      localStorage.setItem('eventBookmarks', JSON.stringify(updatedBookmarks));
      setBookmarked(false);
    } else {
      bookmarks.push({
        date,
        title,
        category: eventCategory,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('eventBookmarks', JSON.stringify(bookmarks));
      setBookmarked(true);
    }
  };

  const handleShare = () => {
    if (!isClient) return;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${decodedTitle} | Türkiye'de Geçmiş Olayları Sorgulama Sistemi`,
        text: `${formatDate(date)} tarihinde gerçekleşen ${decodedTitle} olayı hakkında detaylı bilgi`,
        url: window.location.href,
      })
      .catch((error) => console.log('Paylaşım hatası:', error));
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Sayfa bağlantısı panoya kopyalandı!');
        })
        .catch((error) => {
          console.error('Panoya kopyalama hatası:', error);
        });
    }
  };

  const decodedTitle = title ? decodeURIComponent(title) : '';

  return (
    <>
      <Head>
        <title>{`${decodedTitle} | Türkiye'de Geçmiş Olayları Sorgulama Sistemi`}</title>
        <meta name="description" content={`${formatDate(date)} tarihinde gerçekleşen ${decodedTitle} olayı hakkında detaylı bilgi`} />
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
              <EventIcon sx={{ mr: 0.5 }} fontSize="small" />
              Olay Detayı
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {formatDate(date)}
            </Box>
          </StyledBreadcrumbs>

          <StyledPageHeader>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <SectionTitle variant="h4" component="h1">
                  {decodedTitle}
                </SectionTitle>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={handleBookmark}
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

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <StyledChip
                  icon={<EventIcon />}
                  label={formatDate(date)}
                  size="small"
                  importance="normal"
                />
                <StyledChip
                  icon={getCategoryIcon(eventCategory)}
                  label={eventCategory}
                  size="small"
                  importance="high"
                />
              </Box>

              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{
                  color: '#4facfe',
                  borderColor: 'rgba(79, 172, 254, 0.2)',
                  '&:hover': {
                    borderColor: 'rgba(79, 172, 254, 0.4)',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                  },
                }}
              >
                Geri Dön
              </Button>
            </Box>
          </StyledPageHeader>

          {loading ? (
            <Box sx={{ width: '100%', mb: 4 }}>
              <LinearProgress 
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(45deg, #00f2fe, #4facfe)',
                  },
                }} 
              />
              <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" my={8}>
                <CircularProgress 
                  size={60} 
                  thickness={4} 
                  sx={{
                    color: '#4facfe',
                  }}
                />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  Olay detayları yükleniyor...
                </Typography>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <StyledContentCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <SectionTitle variant="h5">
                      Olay Detayı
                    </SectionTitle>
                    <StyledChip
                      label={detailSource === 'ai' ? 'AI Tarafından Oluşturuldu' : 
                             detailSource === 'cache' ? 'Önbellekten Alındı' : 
                             'Veritabanından Alındı'}
                      size="small"
                      importance={detailSource === 'ai' ? 'high' : 'normal'}
                    />
                  </Box>

                  <StyledDetailContainer source={detailSource}>
                    <Box sx={{ 
                      typography: 'body1', 
                      lineHeight: 1.7,
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: 'Rajdhani',
                    }}>
                      <ReactMarkdown>{eventDetail}</ReactMarkdown>
                    </Box>
                  </StyledDetailContainer>

                  <Alert 
                    severity="info" 
                    sx={{ 
                      mt: 3,
                      backgroundColor: 'rgba(79, 172, 254, 0.1)',
                      border: '1px solid rgba(79, 172, 254, 0.2)',
                      '& .MuiAlert-icon': {
                        color: '#4facfe',
                      },
                    }}
                  >
                    <AlertTitle>Bilgi</AlertTitle>
                    Bu içerik, yapay zeka teknolojisi kullanılarak oluşturulmuştur. İçeriğin doğruluğunu farklı kaynaklardan teyit etmenizi öneririz.
                  </Alert>
                </StyledContentCard>

                <StyledContentCard>
                  <SectionTitle variant="h5">
                    Zaman Çizelgesi
                  </SectionTitle>

                  <Box sx={{ position: 'relative', ml: 4 }}>
                    {timelineItems.map((item) => (
                      <Fade key={item.id} in={true} timeout={500 * item.id}>
                        <StyledTimelineItem color={item.color}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {item.icon}
                            <Typography 
                              variant="h6" 
                              gutterBottom 
                              fontFamily="Rajdhani" 
                              color={item.color}
                              sx={{ ml: 1 }}
                            >
                              {item.title}
                            </Typography>
                          </Box>
                          <Typography variant="body1" color="text.secondary">
                            {item.date}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            {item.content}
                          </Typography>
                        </StyledTimelineItem>
                      </Fade>
                    ))}
                  </Box>
                </StyledContentCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <StyledContentCard>
                  <SectionTitle variant="h5">
                    Benzer Olaylar
                  </SectionTitle>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {relatedEvents.map((event) => (
                      <RelatedEventCard key={event.id}>
                        <Link 
                          href={`/event/${event.date}/${encodeURIComponent(event.title)}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Typography 
                              variant="subtitle1" 
                              gutterBottom 
                              fontFamily="Rajdhani"
                              sx={{
                                color: '#4facfe',
                                textShadow: '0 0 10px rgba(79, 172, 254, 0.3)',
                              }}
                            >
                              {event.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(event.date)}
                            </Typography>
                          </Box>
                        </Link>
                      </RelatedEventCard>
                    ))}
                  </Box>
                </StyledContentCard>

                <StyledContentCard>
                  <SectionTitle variant="h5">
                    Kaynaklar
                  </SectionTitle>

                  <Alert 
                    severity="info" 
                    sx={{ 
                      backgroundColor: 'rgba(79, 172, 254, 0.1)',
                      border: '1px solid rgba(79, 172, 254, 0.2)',
                      '& .MuiAlert-icon': {
                        color: '#4facfe',
                      },
                    }}
                  >
                    <AlertTitle>Bilgi</AlertTitle>
                    Bu içerik, çeşitli kaynaklardan derlenerek AI teknolojisi ile zenginleştirilmiştir.
                  </Alert>

                  <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                    <Box component="li" sx={{ color: 'text.secondary', mb: 1 }}>
                      Resmi Kaynaklar
                    </Box>
                    <Box component="li" sx={{ color: 'text.secondary', mb: 1 }}>
                      Akademik Yayınlar
                    </Box>
                    <Box component="li" sx={{ color: 'text.secondary' }}>
                      Medya Arşivleri
                    </Box>
                  </Box>
                </StyledContentCard>
              </Grid>
            </Grid>
          )}
        </Container>
      </PageContainer>
    </>
  );
} 