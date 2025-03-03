import { useState } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Fade,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';

// İkonlar
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ScienceIcon from '@mui/icons-material/Science';

const CategoryContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(4),
  maxWidth: '900px',
  margin: '0 auto',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(0, 242, 254, 0.1) 0%, transparent 70%)',
    filter: 'blur(40px)',
    zIndex: 0,
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },
}));

const CategoryButton = styled(IconButton)(({ theme, isSelected, isDisabled }) => ({
  width: '100%',
  height: 0,
  paddingBottom: '100%',
  position: 'relative',
  backgroundColor: 'rgba(20, 20, 30, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(79, 172, 254, 0.3)',
  borderRadius: '24px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: isDisabled ? 0.5 : 1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: isSelected 
      ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.15))'
      : 'linear-gradient(135deg, rgba(0, 242, 254, 0.05), rgba(79, 172, 254, 0.05))',
    borderRadius: '24px',
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: -1,
    background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    zIndex: 0,
    opacity: isSelected ? 1 : 0,
    transition: 'opacity 0.4s ease',
  },
  '& .icon-wrapper': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  '& .category-name': {
    fontSize: '0.8rem',
    fontFamily: 'Orbitron',
    fontWeight: 'bold',
    color: isSelected ? '#4facfe' : 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    opacity: 0,
    transform: 'translateY(10px)',
  },
  '& svg': {
    fontSize: '2.5rem',
    color: isSelected ? '#4facfe' : '#fff',
    filter: isSelected ? 'drop-shadow(0 0 10px rgba(79, 172, 254, 0.8))' : 'none',
    transition: 'all 0.4s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    backgroundColor: 'rgba(20, 20, 30, 0.98)',
    boxShadow: '0 8px 30px rgba(0, 242, 254, 0.2)',
    '&::after': {
      opacity: 1,
    },
    '& svg': {
      color: '#4facfe',
      filter: 'drop-shadow(0 0 15px rgba(79, 172, 254, 0.8))',
      transform: 'scale(0.85)',
    },
    '& .category-name': {
      opacity: 1,
      transform: 'translateY(0)',
      color: '#4facfe',
    },
  },
}));

const InfoBox = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(3),
  background: 'rgba(20, 20, 30, 0.98)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(79, 172, 254, 0.2)',
  borderRadius: '16px',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center',
  zIndex: 1000,
  boxShadow: '0 8px 32px rgba(0, 242, 254, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -1,
    background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    maskComposite: 'exclude',
    borderRadius: '16px',
    zIndex: -1,
  },
}));

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Siyasi': return <HistoryEduIcon />;
    case 'Ekonomik': return <TimelineIcon />;
    case 'Sosyal': return <PeopleIcon />;
    case 'Doğal Afet': return <WarningIcon />;
    case 'Spor': return <SportsSoccerIcon />;
    case 'Kültür-Sanat': return <TheaterComedyIcon />;
    case 'Bilim-Teknoloji': return <ScienceIcon />;
    default: return <HistoryEduIcon />;
  }
};

const getCategoryDescription = (category) => {
  switch (category) {
    case 'Siyasi': 
      return 'Seçimler, hükümet değişiklikleri, siyasi olaylar ve dönüm noktaları';
    case 'Ekonomik': 
      return 'Ekonomik krizler, büyük ekonomik kararlar ve finansal dönüm noktaları';
    case 'Sosyal': 
      return 'Toplumsal olaylar, sosyal değişimler ve kültürel dönüşümler';
    case 'Doğal Afet': 
      return 'Depremler, seller ve diğer doğal felaketler';
    case 'Spor': 
      return 'Önemli spor olayları, başarılar ve turnuvalar';
    case 'Kültür-Sanat': 
      return 'Kültürel ve sanatsal gelişmeler, önemli eserler ve etkinlikler';
    case 'Bilim-Teknoloji': 
      return 'Bilimsel ve teknolojik gelişmeler, buluşlar ve yenilikler';
    default: 
      return 'Türkiye tarihindeki önemli olaylar ve dönüm noktaları';
  }
};

export default function CategoryCards({ categories = [], selectedYear, loading = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const handleCategorySelect = (category) => {
    if (selectedYear) {
      router.push(`/category/${selectedYear}/${encodeURIComponent(category)}`);
    }
  };

  const defaultCategories = [
    'Siyasi', 'Ekonomik', 'Sosyal', 'Doğal Afet', 
    'Spor', 'Kültür-Sanat', 'Bilim-Teknoloji'
  ];
  
  const displayCategories = categories.length > 0 ? categories : defaultCategories;
  
  return (
    <Box sx={{ 
      my: 4,
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.97), rgba(20, 20, 30, 0.98))',
      borderRadius: '32px',
      p: 4,
      minHeight: isMobile ? '500px' : '600px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(79, 172, 254, 0.1)',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)',
      },
    }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          textAlign: 'center',
          mb: 6,
          fontFamily: 'Orbitron',
          fontWeight: 'bold',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(79, 172, 254, 0.5)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)',
          },
        }}
      >
        {selectedYear ? `${selectedYear} Yılı İçin Kategori Seçin` : 'Kategoriler'}
      </Typography>

      <CategoryContainer>
        {displayCategories.map((category) => {
          const categoryName = typeof category === 'object' ? category.name : category;
          
          return (
            <CategoryButton
              key={categoryName}
              onClick={() => handleCategorySelect(categoryName)}
              onMouseEnter={() => setHoveredCategory(categoryName)}
              onMouseLeave={() => setHoveredCategory(null)}
              isSelected={hoveredCategory === categoryName}
              isDisabled={!selectedYear}
              aria-label={categoryName}
            >
              <Box className="icon-wrapper">
                {getCategoryIcon(categoryName)}
                <Typography className="category-name">
                  {categoryName}
                </Typography>
              </Box>
            </CategoryButton>
          );
        })}
      </CategoryContainer>

      <Fade in={hoveredCategory !== null}>
        <InfoBox>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontFamily: 'Orbitron',
              color: '#4facfe',
              textShadow: '0 0 10px rgba(79, 172, 254, 0.5)',
              letterSpacing: '0.1em',
            }}
          >
            {hoveredCategory}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'Rajdhani',
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {hoveredCategory && getCategoryDescription(hoveredCategory)}
          </Typography>
        </InfoBox>
      </Fade>

      {!selectedYear && (
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center', 
            mt: 6,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'Rajdhani',
            fontSize: '1rem',
            letterSpacing: '0.05em',
          }}
        >
          Kategori seçmek için önce bir yıl seçmelisiniz.
        </Typography>
      )}
    </Box>
  );
} 