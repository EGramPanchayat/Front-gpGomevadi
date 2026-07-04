import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Divider,
  Paper,
  ThemeProvider,
  createTheme,
} from '@mui/material';

// Define the custom Green Theme
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20', // Dark Forest Green (for button, left panel)
      light: '#4CAF50', // Lighter Green
    },
    secondary: {
      main: '#FF9800', // Orange for highlight text
    },
    background: {
      default: '#F1F8E9', // Very light green background
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: ['"Poppins"', 'sans-serif'].join(','),
  },
});

export default function DakhalaMagani() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: { xs: 4, md: 8 },
          pb: { xs: 4, md: 8 },
          px: { xs: 1, md: 0 },
          bgcolor: 'white',
        }}
      >
        <Paper
          elevation={10}
          sx={{
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            borderRadius: '24px',
            overflow: 'hidden',
            margin: 'auto',
            '& > div:first-of-type': {
              borderRadius: { xs: '24px 24px 0 0', lg: '24px 0 0 24px' },
              flexBasis: { lg: '35%' },
              maxWidth: { lg: '35%' },
            },
            '& > div:last-of-type': {
              borderRadius: { xs: '0 0 24px 24px', lg: '0 24px 24px 0' },
              flexBasis: { lg: '65%' },
              maxWidth: { lg: '65%' },
            },
          }}
        >
          {/* Left Section (Header) */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: { xs: 4, md: 9 },
              flexGrow: 1,
              minHeight: { xs: '300px', lg: '400px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, lineHeight: 1.4, mb: { xs: 2, md: 3 }, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              विविध दाखले मिळविण्यासाठी
              <br /> ऑनलाईन अर्ज
            </Typography>
            <Divider sx={{ bgcolor: 'white', height: '2px', width: '20%', mb: 0 }} />
          </Box>

          {/* Right Section (Info + Redirect Button) */}
          <Box sx={{
            bgcolor: 'background.paper',
            p: { xs: 4, md: 9 },
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontSize: { xs: '0.9rem', md: '1.05rem' },
                textAlign: 'justify',
                color: 'grey.800',
                mb: 4,
              }}
            >
              महाराष्ट्र लोकसेवा हक्क अध्यादेश- 2015 नुसार ऑनलाईन पद्धतीने जन्म
              नोंद/ मृत्यू नोंद/ विवाह नोंदणी दाखला/ दारिद्र्य रेषेखाली असल्याचा
              दाखला/ ग्रामपंचायत येणे बाकी दाखला/ ८ अ उतारा/ निराधार असल्याचा दाखला
              तुम्ही घरबसल्या मागणी करू शकता.

            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/user-login')}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                bgcolor: 'primary.main',
                py: 1.5,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                '&:hover': { bgcolor: '#004D40' },
              }}
            >
              अर्ज मागणी करा
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
