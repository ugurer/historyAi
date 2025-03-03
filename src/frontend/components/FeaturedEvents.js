import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import EventIcon from '@mui/icons-material/Event';

const EventCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
  },
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
}));

const EventMedia = styled(CardMedia)(({ theme }) => ({
  height: 0,
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
  },
}));

const EventDate = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 1,
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  fontWeight: 'bold',
  '& .MuiChip-label': {
    color: '#ffffff'
  }
}));

const EventCategory = styled(Chip)(({ theme, color }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  zIndex: 1,
  backgroundColor: color || theme.palette.secondary.main,
  color: '#ffffff',
  fontWeight: 'bold',
  '& .MuiChip-label': {
    color: '#ffffff'
  }
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

// Tarih formatını düzenle
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Olay görsellerini belirle (gerçek uygulamada API'den gelmeli)
const getEventImage = (eventTitle, category) => {
  // Örnek görseller (gerçek uygulamada API'den gelmeli)
  if (eventTitle.includes('Deprem')) {
    return 'https://cdn.pixabay.com/photo/2016/11/14/04/36/earthquakes-1822835_1280.jpg';
  } else if (eventTitle.includes('Darbe')) {
    return 'https://cdn.pixabay.com/photo/2016/11/23/15/14/crowd-1853662_1280.jpg';
  } else if (eventTitle.includes('Kriz')) {
    return 'https://cdn.pixabay.com/photo/2018/01/18/07/31/bitcoin-3089728_1280.jpg';
  } else if (category === 'Siyasi') {
    return 'https://cdn.pixabay.com/photo/2019/04/14/08/09/turkey-4126719_1280.jpg';
  } else if (category === 'Ekonomik') {
    return 'https://cdn.pixabay.com/photo/2017/12/26/09/15/woman-3040029_1280.jpg';
  } else if (category === 'Sosyal') {
    return 'https://cdn.pixabay.com/photo/2017/07/13/23/11/cinema-2502213_1280.jpg';
  } else if (category === 'Doğal Afet') {
    return 'https://cdn.pixabay.com/photo/2019/09/29/22/06/flood-4514537_1280.jpg';
  } else if (category === 'Spor') {
    return 'https://cdn.pixabay.com/photo/2016/11/29/03/53/athletes-1867185_1280.jpg';
  } else if (category === 'Kültür-Sanat') {
    return 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_1280.jpg';
  } else if (category === 'Bilim-Teknoloji') {
    return 'https://cdn.pixabay.com/photo/2017/12/10/17/00/robot-3010309_1280.jpg';
  } else {
    return 'https://cdn.pixabay.com/photo/2017/08/06/22/01/books-2596809_1280.jpg';
  }
};

// Örnek öne çıkan olaylar
const featuredEvents = [
  {
    id: 1,
    date: '1999-08-17',
    title: 'Marmara Depremi',
    category: 'Doğal Afet',
    importance: 5,
    description: '17 Ağustos 1999\'da meydana gelen 7.4 büyüklüğündeki deprem, Türkiye\'nin en büyük doğal afetlerinden biri olarak kayıtlara geçti.'
  },
  {
    id: 2,
    date: '2016-07-15',
    title: '15 Temmuz Darbe Girişimi',
    category: 'Siyasi',
    importance: 5,
    description: '15 Temmuz 2016\'da gerçekleşen darbe girişimi, halkın direnişiyle engellendi.'
  },
  {
    id: 3,
    date: '2001-02-19',
    title: 'Ekonomik Kriz',
    category: 'Ekonomik',
    importance: 4,
    description: '19 Şubat 2001\'de yaşanan ekonomik kriz, Türkiye ekonomisinde derin izler bıraktı.'
  },
  {
    id: 4,
    date: '2023-02-06',
    title: 'Kahramanmaraş Depremi',
    category: 'Doğal Afet',
    importance: 5,
    description: '6 Şubat 2023\'te meydana gelen depremler, Kahramanmaraş ve çevre illerde büyük yıkıma neden oldu.'
  },
  {
    id: 5,
    date: '2020-03-11',
    title: 'Türkiye\'de İlk COVID-19 Vakası',
    category: 'Sosyal',
    importance: 5,
    description: '11 Mart 2020\'de Türkiye\'de ilk COVID-19 vakası tespit edildi ve pandemi süreci başladı.'
  },
  {
    id: 6,
    date: '2002-11-03',
    title: 'AK Parti İlk Seçim Zaferi',
    category: 'Siyasi',
    importance: 4,
    description: '3 Kasım 2002\'de yapılan genel seçimlerde AK Parti tek başına iktidar oldu.'
  }
];

export default function FeaturedEvents({ events = featuredEvents, loading = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  
  // Olay detayına yönlendirme
  const handleEventClick = (event) => {
    router.push(`/event/${event.date}/${encodeURIComponent(event.title)}`);
  };
  
  return (
    <Box sx={{ my: 6 }}>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold" sx={{ mb: 3 }}>
        Öne Çıkan Olaylar
      </Typography>
      
      <Grid container spacing={3}>
        {loading ? (
          // Yükleme durumunda iskelet göster
          Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton 
                variant="rectangular" 
                height={isMobile ? 200 : 300} 
                sx={{ borderRadius: theme.shape.borderRadius }}
              />
            </Grid>
          ))
        ) : (
          // Olayları göster
          events.map((event, index) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Fade in={true} timeout={500 + (index * 100)}>
                <EventCard>
                  <CardActionArea onClick={() => handleEventClick(event)}>
                    <Box sx={{ position: 'relative' }}>
                      <EventMedia
                        image={getEventImage(event.title, event.category)}
                        title={event.title}
                      />
                      <EventDate 
                        icon={<EventIcon />} 
                        label={formatDate(event.date)}
                      />
                      <EventCategory 
                        label={event.category}
                        sx={{ backgroundColor: getCategoryColor(event.category, theme) }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
                        {event.title}
                      </Typography>
                      {(!isMobile || index < 2) && (
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </EventCard>
              </Fade>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
} 