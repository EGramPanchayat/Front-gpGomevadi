import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Grid
} from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';

// --- CONFIGURATION CONSTANTS ---
const QR_CODE_URL = "https://placehold.co/150x150/1B5E20/FFFFFF?text=SCAN+20+Rs"; 
const PAYMENT_AMOUNT = '20';
const FEE_REQUIRED_TYPES = [
    'जन्म नोंद', 
    'मृत्यू नोंद', 
    'विवाह नोंदणी दाखला', 
    '८ अ उतारा', 
    'ग्रामपंचायत येणे बाकी दाखला'
];
const FEE_EXEMPT_TYPES = [
    'दारिद्र्य रेषेखाली असल्याचा दाखला', 
    'निराधार असल्याचा दाखला मागणी'
];
// -----------------------------

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

// Mock Backend Submission Function (Placeholder)
const submitToBackend = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  if (Math.random() > 0.1) {
    return { success: true, message: "अर्ज यशस्वीरित्या स्वीकारला गेला आणि प्रक्रिया सुरू आहे." };
  } else {
    // Simulate a submission failure (e.g., server down, auth error)
    throw new Error("सर्व्हर प्रतिसाद देऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.");
  }
};

export default function DakhalaMagani() {
  // --- STATE MANAGEMENT ---
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', type: '', birthDate: '', childName: '', 
    deathName: '', deathDate: '', coupleName: '', marriageYear: '', propertyNo: '', 
    certificateName: '', niradharName: '', paymentScreenshot: null, 
  });
  
  const [apiState, setApiState] = useState({
    submissionLoading: false,
  });

  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null); // Image preview URL

  const isPaymentRequired = FEE_REQUIRED_TYPES.includes(form.type);

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    // 1. Basic Fields Check (Name, Email, Type)
    if (!form.name || !form.email || !form.type) {
        return "कृपया आपले नाव, ईमेल आणि आवश्यक दाखल्याचा प्रकार निवडा.";
    }

    // 2. Conditional Field Check
    switch (form.type) {
        case 'जन्म नोंद':
            if (!form.childName || !form.birthDate) return "जन्म नोंदीसाठी बाळाचे नाव आणि जन्मतारीख आवश्यक आहे.";
            break;
        case 'मृत्यू नोंद':
            if (!form.deathName || !form.deathDate) return "मृत्यू नोंदीसाठी मृत व्यक्तीचे नाव आणि मृत्यूची तारीख आवश्यक आहे.";
            break;
        case 'विवाह नोंदणी दाखला':
            if (!form.coupleName || !form.marriageYear) return "विवाह दाखल्यासाठी दांपत्याचे नाव आणि नोंदणीचे वर्ष आवश्यक आहे.";
            break;
        case '८ अ उतारा':
            if (!form.propertyNo) return "८ अ उताऱ्यासाठी मिळकत नंबर आवश्यक आहे.";
            break;
        case 'निराधार असल्याचा दाखला मागणी':
            if (!form.niradharName) return "निराधार दाखल्यासाठी संपूर्ण नाव आवश्यक आहे.";
            break;
        case 'दारिद्र्य रेषेखाली असल्याचा दाखला':
        case 'ग्रामपंचायत येणे बाकी दाखला':
            if (!form.certificateName) return "या दाखल्यासाठी अर्जदाराचे संपूर्ण नाव आवश्यक आहे.";
            break;
        default:
            break;
    }

    // 3. Payment Check
    if (isPaymentRequired && !form.paymentScreenshot) {
        return `हा दाखला मिळवण्यासाठी ₹${PAYMENT_AMOUNT} चे शुल्क भरून स्क्रीनशॉट अपलोड करा.`;
    }
    
    return null; // All checks passed
  };
  // -------------------------

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files.length > 0) {
        const file = files[0];
        setForm({ ...form, [name]: file });
        setPaymentScreenshotPreview(URL.createObjectURL(file)); // Create local URL for preview
    } else {
        setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
        toast.error(validationError);
        return;
    }
    
    setApiState(prev => ({ ...prev, submissionLoading: true }));
    
    try {
        
        
        const result = await submitToBackend(form);
        
        if (result.success) {
            toast.success('आपला अर्ज यशस्वीरित्या पाठवला गेला ✅');
            // Optionally clear form here: setForm({ ...initialState });
        }
    } catch (error) {
        toast.error(`अर्जात त्रुटी: ${error.message}`);
    } finally {
        setApiState(prev => ({ ...prev, submissionLoading: false }));
    }
  };
  // -------------------------

  const certificateOptions = [
    { value: 'जन्म नोंद', label: 'जन्म नोंद' },
    { value: 'मृत्यू नोंद', label: 'मृत्यू नोंद' },
    { value: 'विवाह नोंदणी दाखला', label: 'विवाह नोंदणी दाखला' },
    { value: '८ अ उतारा', label: '८ अ उतारा' },
    { value: 'दारिद्र्य रेषेखाली असल्याचा दाखला', label: 'दारिद्र्य रेषेखाली असल्याचा दाखला' },
    { value: 'ग्रामपंचायत येणे बाकी दाखला', label: 'ग्रामपंचायत येणे बाकी दाखला' },
    { value: 'निराधार असल्याचा दाखला मागणी', label: 'निराधार असल्याचा दाखला मागणी' },
  ];

  // --- REUSABLE INPUT FIELD COMPONENT ---
  const InputField = ({ label, name, type = 'text', placeholder, required = false, ...props }) => (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      placeholder={placeholder}
      value={form[name]}
      onChange={handleChange}
      required={required}
      variant="outlined"
      InputLabelProps={type === 'date' ? { shrink: true } : {}}
      sx={{
        '& .MuiInputBase-root': { borderRadius: '12px' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'grey.400' },
          '&:hover fieldset': { borderColor: 'grey.600' },
          '&.Mui-focused fieldset': { borderColor: 'primary.main' },
        },
        '& .MuiInputLabel-root': { color: 'grey.700', fontWeight: 600 },
        ...props.sx,
      }}
    />
  );
  // ----------------------------------------

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 2, md: 4 }, // Reduced padding for mobile
          bgcolor: 'background.default', // Lightest green background
        }}
      >
        <Toaster position="top-right" reverseOrder={false} />

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
            // --- LAPTOP / LARGE SCREEN SIZING ---
            '& > div:first-of-type': { 
                borderRadius: { xs: '24px 24px 0 0', lg: '24px 0 0 24px' },
                flexBasis: { lg: '35%' }, // 35% width for left part
                maxWidth: { lg: '35%' },
            },
            '& > div:last-of-type': { 
                borderRadius: { xs: '0 0 24px 24px', lg: '0 24px 24px 0' },
                flexBasis: { lg: '65%' }, // 65% width for right part
                maxWidth: { lg: '65%' },
            },
          }}
        >
          {/* Left Section (Header) */}
          <Box
            sx={{
              bgcolor: 'primary.main', // Deep Green
              color: 'white',
              p: { xs: 3, md: 6 }, // Reduced padding for mobile
              flexGrow: 1,
              minHeight: { xs: '250px', lg: 'auto' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, lineHeight: 1.4, mb: { xs: 2, md: 3 }, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              विविध दाखले मिळविण्यासाठी
              <br /> ऑनलाईन अर्ज
            </Typography>
            <Divider sx={{ bgcolor: 'white', height: '2px', width: '20%', mb: { xs: 3, md: 4 } }} />
            <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' } }}>
              महाराष्ट्र लोकसेवा हक्क अध्यादेश- 2015 नुसार ऑनलाईन पद्धतीने जन्म
              नोंद/ मृत्यू नोंद/ विवाह नोंदणी दाखला/ दारिद्र्य रेषेखाली असल्याचा
              दाखला/ ग्रामपंचायत येणे बाकी दाखला/ ८ अ उतारा/ निराधार असल्याचा दाखला
              मागणी करण्यासाठी खालील फॉर्म भरून पाठवा.
            </Typography>
          </Box>

          {/* Right Section (Form) */}
          <Box sx={{ bgcolor: 'background.paper', p: { xs: 3, md: 6 }, flexGrow: 1 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: '20px' }}>

              {/* नाव (Name) */}
              <InputField label="नाव" name="name" placeholder="नाव टाका" required />

              {/* मोबाईल नंबर (Mobile) */}
              <InputField label="मोबाईल नंबर" name="mobile" type="number" placeholder="मोबाईल नंबर टाका" />

              {/* ईमेल (Email) */}
              <InputField label="ईमेल" name="email" type="email" placeholder="इमेल टाका" required />

              {/* दाखला प्रकार (Certificate Type Dropdown) */}
              <FormControl fullWidth required>
                <InputLabel sx={{ fontWeight: 600 }}>खालीलपैकी कोणता दाखला हवा आहे?</InputLabel>
                <Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  label="खालीलपैकी कोणता दाखला हवा आहे?"
                  sx={{ borderRadius: '12px', bgcolor: 'white' }}
                >
                  <MenuItem value="">निवडा</MenuItem>
                  {certificateOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* --- Conditional Fields --- */}

              {/* जन्म नोंद (Birth Name & Date) */}
              {form.type === 'जन्म नोंद' && (
                <>
                  <InputField key="childName" label="बाळाचे संपूर्ण नाव" name="childName" placeholder="बाळाचे संपूर्ण नाव टाका" required />
                  <InputField key="birthDate" label="जन्मतारीख" name="birthDate" type="date" required />
                </>
              )}

              {/* मृत्यू नोंद (Death Details) */}
              {form.type === 'मृत्यू नोंद' && (
                <>
                  <InputField key="deathName" label="मृत व्यक्तीचे नाव" name="deathName" placeholder="मृत व्यक्तीचे नाव टाका" required />
                  <InputField key="deathDate" label="मृत्यूची तारीख" name="deathDate" type="date" required />
                </>
              )}

              {/* विवाह नोंदणी दाखला (Marriage Details) */}
              {form.type === 'विवाह नोंदणी दाखला' && (
                <>
                  <InputField key="couple" label="दांपत्याचे संपूर्ण नाव" name="coupleName" placeholder="दांपत्याचे संपूर्ण नाव टाका" required />
                  <InputField key="marriage" label="विवाह नोंदणीचे वर्ष" name="marriageYear" placeholder="विवाह नोंदणीचे वर्ष टाका (उदा. २०२०)" required />
                </>
              )}

              {/* ८ अ उतारा (Property Number) */}
              {form.type === '८ अ उतारा' && (
                <InputField key="property" label="मिळकत नंबर" name="propertyNo" placeholder="मिळकत नंबर टाका" required />
              )}

              {/* दारिद्र्य / येणे बाकी दाखला (General Certificate Name) */}
              {FEE_REQUIRED_TYPES.includes(form.type) || FEE_EXEMPT_TYPES.includes(form.type) ? (
                 (
                    <InputField key="certName" label="ज्याच्या नावे दाखला आवश्यक आहे त्याचे संपूर्ण नाव" name="certificateName" placeholder="नाव टाका" required />
                  )
              ) : null}

              {/* निराधार असल्याचा दाखला मागणी (Destitute Name) - Unique Field */}
              {form.type === 'निराधार असल्याचा दाखला मागणी' && (
                <InputField key="niradhar" label="निराधाराचे संपूर्ण नाव" name="niradharName" placeholder="निराधाराचे संपूर्ण नाव टाका" required />
              )}
              
              {/* --- PAYMENT / FEE SECTION (IMPROVED TWO-COLUMN CARD LAYOUT) --- */}
              {form.type && (
                  <Box sx={{ p: { xs: 1.5, md: 2 }, bgcolor: '#f5f5f5', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        {isPaymentRequired ? `शुल्क: ₹${PAYMENT_AMOUNT} भरणे आवश्यक` : 'शुल्क: माफ (Exempted)'}
                    </Typography>

                    {isPaymentRequired ? (
                      <Grid container spacing={2} justifyContent="center" alignItems="stretch" disableEqualOverflow>
                        
                        {/* LEFT: SCREENSHOT PREVIEW CARD (Modernized Grid syntax) */}
                        <Grid item={true} xs={12} sm={6} sx={{ flexGrow: 1, p: 0 }}>
                          <Paper elevation={3} sx={{ p: { xs: 1.5, md: 2 }, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                            
                            {/* Orange Header */}
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                पेमेंट स्क्रीनशॉट अपलोड करा
                            </Typography>
                            
                            {/* Preview Area */}
                            <Box sx={{ height: 150, width: '100%', mb: 1, border: '2px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                                {paymentScreenshotPreview ? (
                                    <Box component="img" src={paymentScreenshotPreview} alt="Screenshot Preview" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Typography variant="caption" color="textSecondary">
                                        स्क्रीनशॉट प्रिव्ह्यू दिसेल
                                    </Typography>
                                )}
                            </Box>

                            {/* Upload Button */}
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ textTransform: 'none', borderRadius: '8px', fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                            >
                                {form.paymentScreenshot ? `फाइल निवडली: ${form.paymentScreenshot.name}` : 'स्क्रीनशॉट निवडा (.jpg/.png)'}
                                <input
                                  type="file"
                                  hidden
                                  accept=".jpg,.png,image/*"
                                  name="paymentScreenshot"
                                  onChange={handleChange}
                                  required
                                />
                            </Button>
                          </Paper>
                        </Grid>

                        {/* RIGHT: QR CODE SCAN CARD (Modernized Grid syntax) */}
                        <Grid item={true} xs={12} sm={6} sx={{ flexGrow: 1, p: 0 }}>
                          <Paper elevation={3} sx={{ p: { xs: 1.5, md: 2 }, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                            <Typography variant="body1" sx={{ mb: 1, fontWeight: 700, color: 'secondary.main', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                              ₹{PAYMENT_AMOUNT} शुल्क भरा (UPI)
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, border: '1px solid #aaa', borderRadius: '8px', bgcolor: 'white' }}>
                              <Box component="img" src={QR_CODE_URL} alt="Scan to Pay QR Code" sx={{ width: 140, height: 140, borderRadius: '4px' }} />
                            </Box>
                            <Typography variant="caption" display="block" align="center" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>
                               या QR कोडवर स्कॅन करून पेमेंट करा.
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="success.main" sx={{ p: 1 }}>
                        ✅ हा दाखला दारिद्र्य/निराधार श्रेणीतील असल्याने, कोणतेही शुल्क लागू नाही.
                      </Typography>
                    )}
                  </Box>
              )}
              {/* --- End PAYMENT / FEE SECTION --- */}


              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={apiState.submissionLoading}
                sx={{
                  mt: 3,
                  borderRadius: '12px',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: '#004D40' }
                }}
              >
                {apiState.submissionLoading ? <CircularProgress size={24} color="inherit" /> : 'अर्ज पाठवा आणि सबमिट करा'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
