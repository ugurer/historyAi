import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery, 
  IconButton, 
  Card,
  CardContent,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Timeline';
import FlagIcon from '@mui/icons-material/Flag';
import StarIcon from '@mui/icons-material/Star';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const TimelineContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95))'
    : 'linear-gradient(to right, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.98))',
  boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
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
    '0%': {
      backgroundPosition: '-200% 0',
    },
    '100%': {
      backgroundPosition: '200% 0',
    },
  },
}));

const TimelineScroll = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'hidden',
  position: 'relative',
  padding: theme.spacing(2, 0),
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  '-ms-overflow-style': 'none',
  'scrollbar-width': 'none',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.5), transparent)',
  },
}));

const YearCard = styled(Card)(({ theme, isSelected, hasEvents }) => ({
  minWidth: 120,
  maxWidth: 140,
  height: 160,
  margin: theme.spacing(0, 0.5),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isSelected ? 'scale(1.05) translateY(-8px)' : 'scale(1)',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  background: isSelected 
    ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(79, 172, 254, 0.2))'
    : 'rgba(20, 20, 20, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.2)',
  boxShadow: isSelected 
    ? '0 0 15px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(79, 172, 254, 0.2)' 
    : '0 0 10px rgba(0, 0, 0, 0.3)',
  '&:hover': {
    transform: 'scale(1.05) translateY(-8px)',
    boxShadow: '0 0 20px rgba(0, 242, 254, 0.4), inset 0 0 30px rgba(79, 172, 254, 0.3)',
    border: '1px solid rgba(79, 172, 254, 0.4)',
    '&::after': {
      opacity: 1,
    },
  },
  '&::before': hasEvents ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)',
    animation: 'glow 2s linear infinite',
  } : {},
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: 'linear-gradient(135deg, transparent 40%, rgba(79, 172, 254, 0.1))',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(79, 172, 254, 0.2)',
  color: '#4facfe',
  boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)',
  zIndex: 1,
  '&:hover': {
    backgroundColor: 'rgba(79, 172, 254, 0.1)',
    boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)',
  },
}));

const EventChip = styled(Chip)(({ theme, importance }) => ({
  margin: theme.spacing(0.25),
  height: 24,
  fontSize: '0.75rem',
  backgroundColor: 'transparent',
  border: `1px solid ${importance === 'high' ? '#ff4b4b' : '#4facfe'}`,
  color: importance === 'high' ? '#ff4b4b' : '#4facfe',
  backdropFilter: 'blur(4px)',
  '& .MuiChip-icon': {
    color: 'inherit',
    fontSize: '0.875rem',
  },
  '& .MuiChip-label': {
    padding: '0 8px',
  },
  '&:hover': {
    boxShadow: `0 0 10px ${importance === 'high' ? 'rgba(255, 75, 75, 0.3)' : 'rgba(79, 172, 254, 0.3)'}`,
  },
}));

// Önemli tarihsel olaylar
const significantYears = [
  { year: 1923, label: 'Cumhuriyet', description: 'Türkiye Cumhuriyeti\'nin kuruluşu', importance: 'high' },
  { year: 1938, label: 'Atatürk', description: 'Mustafa Kemal Atatürk\'ün vefatı', importance: 'high' },
  { year: 1950, label: 'Çok Partili', description: 'Çok partili hayata geçiş', importance: 'medium' },
  { year: 1960, label: 'Darbe', description: '27 Mayıs Darbesi', importance: 'high' },
  { year: 1980, label: 'Darbe', description: '12 Eylül Darbesi', importance: 'high' },
  { year: 1999, label: 'Deprem', description: 'Marmara Depremi', importance: 'high' },
  { year: 2001, label: 'Kriz', description: 'Ekonomik Kriz', importance: 'medium' },
  { year: 2016, label: 'Darbe Girişimi', description: '15 Temmuz Darbe Girişimi', importance: 'high' },
  { year: 2023, label: 'Deprem', description: 'Kahramanmaraş Depremi', importance: 'high' },
];

export default function TimelineSlider({ onYearChange, initialYear = new Date().getFullYear() }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollRef = useRef(null);
  
  const startYear = 1923;
  const endYear = new Date().getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [hoveredYear, setHoveredYear] = useState(null);

  useEffect(() => {
    if (onYearChange) {
      onYearChange(selectedYear);
    }
  }, [selectedYear, onYearChange]);

  const handleYearClick = (year) => {
    setSelectedYear(year);
    const card = document.getElementById(`year-${year}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getEventIcon = (importance) => {
    switch (importance) {
      case 'high':
        return <StarIcon fontSize="small" />;
      case 'medium':
        return <FlagIcon fontSize="small" />;
      default:
        return <TimelineIcon fontSize="small" />;
    }
  };

  const getYearEvents = (year) => {
    return significantYears.filter(event => event.year === year);
  };

  return (
    <TimelineContainer elevation={3}>
      <Box sx={{ width: '100%', position: 'relative' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          color: '#4facfe',
          textShadow: '0 0 10px rgba(79, 172, 254, 0.5)'
        }}>
          <TimelineIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Tarih Tüneli
          </Typography>
        </Box>

        <NavigationButton
          onClick={() => handleScroll('left')}
          sx={{ left: 8 }}
          size="small"
        >
          <NavigateBeforeIcon />
        </NavigationButton>

        <TimelineScroll ref={scrollRef}>
          {years.map((year) => {
            const events = getYearEvents(year);
            const hasEvents = events.length > 0;
            
            return (
              <Zoom 
                key={year} 
                in={true} 
                style={{ 
                  transitionDelay: `${(year - startYear) * 50}ms`
                }}
              >
                <YearCard
                  id={`year-${year}`}
                  isSelected={selectedYear === year}
                  hasEvents={hasEvents}
                  onClick={() => handleYearClick(year)}
                  onMouseEnter={() => setHoveredYear(year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  <CardContent sx={{ 
                    p: 1.5, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      fontWeight="bold"
                      color={selectedYear === year ? '#4facfe' : '#fff'}
                      align="center"
                      sx={{ 
                        mb: 1,
                        textShadow: selectedYear === year ? '0 0 10px rgba(79, 172, 254, 0.5)' : 'none'
                      }}
                    >
                      {year}
                    </Typography>

                    {hasEvents && (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.5, 
                        justifyContent: 'center',
                        flex: 1
                      }}>
                        {events.map((event) => (
                          <EventChip
                            key={event.label}
                            icon={getEventIcon(event.importance)}
                            label={event.label}
                            size="small"
                            importance={event.importance}
                          />
                        ))}
                      </Box>
                    )}

                    {hoveredYear === year && hasEvents && (
                      <Fade in={true}>
                        <Typography 
                          variant="caption" 
                          color="rgba(255, 255, 255, 0.7)"
                          sx={{ 
                            mt: 'auto',
                            textAlign: 'center',
                            fontSize: '0.7rem',
                            textShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {events[0].description}
                        </Typography>
                      </Fade>
                    )}
                  </CardContent>
                </YearCard>
              </Zoom>
            );
          })}
        </TimelineScroll>

        <NavigationButton
          onClick={() => handleScroll('right')}
          sx={{ right: 8 }}
          size="small"
        >
          <NavigateNextIcon />
        </NavigationButton>

        {selectedYear && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {selectedYear}
            </Typography>
            {getYearEvents(selectedYear).map((event) => (
              <Fade key={event.label} in={true}>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {event.description}
                </Typography>
              </Fade>
            ))}
          </Box>
        )}
      </Box>
    </TimelineContainer>
  );
} 