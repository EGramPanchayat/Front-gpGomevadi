import React, { useState, useEffect } from 'react';

// --- MEMOIZED REUSABLE INPUT FIELD COMPONENT ---
const InputField = React.memo(function InputField({
  label, name, type = 'text', placeholder, required = false, value, onChange
}) {
  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
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
      }}
    />
  );
});
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
} from '@mui/material';
import { Toaster, toast } from 'react-hot-toast';
import axioesInstance from '../utils/axioesInstance';

// --- CONFIGURATION CONSTANTS ---
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

export default function DakhalaMagani() {
  // --- STATE MANAGEMENT ---
  const [form, setForm] = useState({
    forName: '', whatsappNo: '', email: '', type: '', dob: '', childName: '', 
    deathName: '', deathDate: '', coupleName: '', marriageYear: '', propertyNo: '', 
    certificateName: '', niradharName: '', paymentScreenshot: null, 
  });
  
  const [apiState, setApiState] = useState({ submissionLoading: false });
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null); // Image preview URL
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const isPaymentRequired = FEE_REQUIRED_TYPES.includes(form.type);

  useEffect(() => {
    let mounted = true;
    async function fetchQR() {
      try {
        const { data } = await axioesInstance.get('/payment-qr');
        if (!mounted) return;
        // backend returns either { url, publicId } or just { url }
        const url = data?.url || (typeof data === 'string' ? data : null);
        setQrCodeUrl(url);
      } catch (err) {
        if (mounted) setQrCodeUrl(null);
      }
    }
    fetchQR();
    return () => { mounted = false; };
  }, []);

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    // 1. Basic Fields Check (Name, Email, Type)
    if (!form.forName || !form.email || !form.type) {
        return "कृपया आपले नाव, ईमेल आणि आवश्यक दाखल्याचा प्रकार निवडा.";
    }

    // 2. Conditional Field Check
    switch (form.type) {
        case 'जन्म नोंद':
            if (!form.childName || !form.dob) return "जन्म नोंदीसाठी बाळाचे नाव आणि जन्मतारीख आवश्यक आहे.";
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

    // File input path with client-side validation
    if (type === 'file') {
      if (!files || files.length === 0) return; // no file selected
      const file = files[0];

      // Basic client-side validation
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (!file.type || !file.type.startsWith('image/')) {
        toast.error('कृपया प्रतिमा फाइल (.jpg/.png/.webp) निवडा');
        return;
      }
      if (file.size > maxSize) {
        toast.error('फाइल खूप मोठी आहे — जास्तीत जास्त 5MB परवान्य आहे');
        return;
      }

      setPaymentScreenshotPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, [name]: file }));
      return;
    }

    // Non-file inputs
    setForm((prev) => {
      const updated = { ...prev };
      updated[name] = value;

      if (name === 'type') {
        const newTypeRequiresPayment = FEE_REQUIRED_TYPES.includes(value);
        if (!newTypeRequiresPayment || !value) {
          updated.paymentScreenshot = null;
          setPaymentScreenshotPreview(null);
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // WhatsApp number validation (10 digits only)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(form.whatsappNo)) {
      toast.error('व्हॉट्सऍप क्रमांक 10 अंकांचा असावा');
      return;
    }
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setApiState(prev => ({ ...prev, submissionLoading: true }));
    try {
      const formData = new FormData();
      // Append all expected fields as strings (or empty string) so backend has consistent keys
      const expectedKeys = ['forName','whatsappNo','email','type','dob','childName','deathName','deathDate','coupleName','marriageYear','propertyNo','certificateName','niradharName'];
      for (const k of expectedKeys) {
        const v = form[k] ?? '';
        formData.append(k, typeof v === 'string' ? v : String(v));
      }
      // Attach file under 'file' if present
      if (form.paymentScreenshot) {
        formData.append('file', form.paymentScreenshot);
      }


      



      const res = await axioesInstance.post(
        "/dakhala-magani",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

    
      toast.success(res.data?.message || 'आपला अर्ज यशस्वीरित्या पाठवला गेला ');
      setForm({ forName: '', whatsappNo: '', email: '', type: '', dob: '', childName: '', deathName: '', deathDate: '', coupleName: '', marriageYear: '', propertyNo: '', certificateName: '', niradharName: '', paymentScreenshot: null });
      setPaymentScreenshotPreview(null);
    } catch (error) {
      toast.error(`अर्जात त्रुटी: ${error.response?.data?.message || error.message}`);
    } finally {
      setApiState(prev => ({ ...prev, submissionLoading: false }));
    }
  };
  // -------------------------

  const certificateOptions = FEE_REQUIRED_TYPES.concat(FEE_EXEMPT_TYPES);


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
            <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: { xs: '0.85rem', md: '1rem' }, textAlign: 'justify' }}>
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
              <InputField label="नाव" name="forName" value={form.forName} onChange={handleChange} placeholder="नाव टाका" required />

              {/* मोबाईल नंबर (Mobile) */}
              <InputField label="मोबाईल नंबर" name="whatsappNo" type="number" value={form.whatsappNo} onChange={handleChange} placeholder="मोबाईल नंबर टाका" />

              {/* ईमेल (Email) */}
              <InputField label="ईमेल" name="email" type="email" value={form.email} onChange={handleChange} placeholder="इमेल टाका" required />

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
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* --- Conditional Fields --- */}


              {/* जन्म नोंद (Birth Name & Date) */}
              {form.type === 'जन्म नोंद' && (
                <>
                  <InputField label="बाळाचे संपूर्ण नाव" name="childName" value={form.childName} onChange={handleChange} placeholder="बाळाचे संपूर्ण नाव टाका" required />
                  <InputField label="जन्मतारीख" name="dob" type="date" value={form.dob} onChange={handleChange} required />
                </>
              )}


              {/* मृत्यू नोंद (Death Details) */}
              {form.type === 'मृत्यू नोंद' && (
                <>
                  <InputField label="मृत व्यक्तीचे नाव" name="deathName" value={form.deathName} onChange={handleChange} placeholder="मृत व्यक्तीचे नाव टाका" required />
                  <InputField label="मृत्यूची तारीख" name="deathDate" type="date" value={form.deathDate} onChange={handleChange} required />
                </>
              )}


              {/* विवाह नोंदणी दाखला (Marriage Details) */}
              {form.type === 'विवाह नोंदणी दाखला' && (
                <>
                  <InputField label="दांपत्याचे संपूर्ण नाव" name="coupleName" value={form.coupleName} onChange={handleChange} placeholder="दांपत्याचे संपूर्ण नाव टाका" required />
                  <InputField label="विवाह नोंदणीचे वर्ष" name="marriageYear" value={form.marriageYear} onChange={handleChange} placeholder="विवाह नोंदणीचे वर्ष टाका (उदा. २०२०)" required />
                </>
              )}


              {/* ८ अ उतारा (Property Number) */}
              {form.type === '८ अ उतारा' && (
                <InputField label="मिळकत नंबर" name="propertyNo" value={form.propertyNo} onChange={handleChange} placeholder="मिळकत नंबर टाका" required />
              )}


        {/* दारिद्र्य / येणे बाकी दाखला (General Certificate Name) */}
        {FEE_REQUIRED_TYPES.includes(form.type) || FEE_EXEMPT_TYPES.includes(form.type) ? (
          // Use the certificateName field only if it's not a specific type that uses other fields (like birth/death/marriage/niradhar)
          !['जन्म नोंद', 'मृत्यू नोंद', 'विवाह नोंदणी दाखला', 'निराधार असल्याचा दाखला मागणी'].includes(form.type) && (
            <InputField label="ज्याच्या नावे दाखला आवश्यक आहे त्याचे संपूर्ण नाव" name="certificateName" value={form.certificateName} onChange={handleChange} placeholder="नाव टाका" required />
          )
        ) : null}


              {/* निराधार असल्याचा दाखला मागणी (Destitute Name) - Unique Field */}
              {form.type === 'निराधार असल्याचा दाखला मागणी' && (
                <InputField label="निराधाराचे संपूर्ण नाव" name="niradharName" value={form.niradharName} onChange={handleChange} placeholder="निराधाराचे संपूर्ण नाव टाका" required />
              )}
              
              {/* --- PAYMENT / FEE SECTION (FLEX LAYOUT) --- */}
              {form.type && (
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, md: 2 }, 
                      bgcolor: 'secondary.main', // Outer background to Orange
                      borderRadius: '12px', 
                      border: '1px solid #ddd',
                      width: '100%' 
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white', // Text color to White
                        mb: 2, 
                        fontWeight: 700, 
                        fontSize: { xs: '1rem', md: '1.25rem' } 
                      }}
                    >
                      {isPaymentRequired ? `शुल्क: ₹${PAYMENT_AMOUNT} भरणे आवश्यक आहे.` : 'शुल्क: माफ (Exempted)'}
                    </Typography>

                    {isPaymentRequired ? (
                      // Removed Grid and replaced with Flexbox
                      <Box 
                        sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, row on tablet/desktop
                            gap: '16px', // Spacing between cards
                            alignItems: 'stretch', // Ensure all cards stretch to the full height of the container
                            width: '100%',
                        }}
                      >
                        
                        {/* LEFT: SCREENSHOT PREVIEW CARD */}
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              p: 3, 
                              flex: 1, // Takes up equal space in the row
                              minWidth: 0, // Allows shrinking on smaller screens
                              minHeight: 320, // Match screenshot card
                              height: '100%', // Ensure full height
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              borderRadius: '12px',
                              boxSizing: 'border-box',
                            }}
                          >
                          
                          {/* Header */}
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 1, 
                              fontWeight: 700, 
                              color: 'primary.main', 
                              fontSize: { xs: '0.9rem', md: '1rem' }, 
                              textAlign: 'center',
                            }}
                          > 
                            पेमेंट स्क्रीनशॉट अपलोड करा
                          </Typography>
                          
                          {/* Preview Area (Fixed Size Box - Height 180) */}
                          <Box sx={{ 
                              flexGrow: 1,
                              height: 180, 
                              width: '100%', 
                              mb: 2, 
                              border: '2px dashed #ccc', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              bgcolor: '#fff', 
                              borderRadius: '8px', 
                              overflow: 'hidden' 
                          }}>
                            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                              <Box
                                component="img"
                                src="/images/no-image.png"
                                alt="No Screenshot"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.5,
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  zIndex: 1
                                }}
                              />
                              {paymentScreenshotPreview && (
                                <Box
                                  component="img"
                                  src={paymentScreenshotPreview}
                                  alt="Screenshot Preview"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    position: 'relative',
                                    zIndex: 2
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          {/* Upload Button */}
                          <Button
                              variant="contained" 
                              component="label"
                              fullWidth
                              sx={{ 
                                textTransform: 'none', 
                                borderRadius: '8px', 
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                bgcolor: 'secondary.main', 
                                color: 'white', 
                                fontWeight: 700,
                                p: 1.5, 
                                '&:hover': {
                                  bgcolor: '#E68A00', 
                                }
                              }}
                          >
                              {form.paymentScreenshot ? `फाइल निवडली: ${form.paymentScreenshot.name}` : 'स्क्रीनशॉट निवडा (.jpg/.png)'}
                              <input
                                type="file"
                                hidden
                                accept=".jpg,.png,image/*"
                                name="paymentScreenshot"
                                onChange={handleChange}
                              />
                          </Button>
                         
                         
                        </Paper>


                        
                        {/* RIGHT: QR CODE SCAN CARD */}
                        <Paper 
                          elevation={3} 
                          sx={{ 
                            p: 3, 
                            flex: 1, // Takes up equal space in the row
                            minWidth: 0, // Allows shrinking on smaller screens
                            minHeight: 320, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            borderRadius: '12px',
                            boxSizing: 'border-box',
                          }}
                        >
                          
                          {/* Header */}
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              mb: 1, 
                              fontWeight: 700, 
                              color: 'primary.main', 
                              fontSize: { xs: '0.9rem', md: '1rem' }, 
                              textAlign: 'center',
                            }}
                          > 
                            ₹{PAYMENT_AMOUNT} शुल्क भरा (UPI)
                          </Typography>
                          
                          {/* QR Code Box (Fixed Size Box - Height 180) */}
                          <Box 
                            sx={{ 
                              flexGrow: 1,
                              height: 180, 
                              width: '100%', 
                              mb: 2, 
                              border: '2px dashed', 
                              borderColor: 'grey.400', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              bgcolor: '#fff', 
                              borderRadius: '8px', 
                              overflow: 'hidden' 
                            }}
                          >
                            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                              <Box
                                component="img"
                                src="/images/no-image.png"
                                alt="No QR"
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.5,
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  zIndex: 1
                                }}
                              />
                              {qrCodeUrl && (
                                <Box
                                  component="img"
                                  src={qrCodeUrl}
                                  alt="Scan to Pay QR Code"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    position: 'relative',
                                    zIndex: 2
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                          
                          {/* Caption wrapped in Orange Box */}
                          <Box sx={{ 
                            width: '100%', 
                            p: 1.5, 
                            bgcolor: 'secondary.main', 
                            borderRadius: '8px', 
                            textAlign: 'center' 
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                              QR कोड स्कॅन करून पेमेंट करा.
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ p: 1, color: 'white' }}> 
                        ✅ हा दाखला दारिद्र्य/निराधार श्रेणीतील  gg असल्याने, कोणतेही शुल्क लागू नाही.
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
                {apiState.submissionLoading ? <CircularProgress size={24} color="inherit" /> : 'अर्ज सबमिट करा'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
