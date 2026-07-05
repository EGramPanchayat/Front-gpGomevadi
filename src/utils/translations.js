// Central translations map for the entire application
// Usage: const { t } = useLanguage(); then use t("key")

export const translations = {
  // ─── NAVIGATION & GENERAL ───
  back: { en: "Back", mr: "मागे जा" },
  close: { en: "Close", mr: "बंद करा" },
  save: { en: "Save", mr: "जतन करा" },
  cancel: { en: "Cancel", mr: "रद्द करा" },
  search: { en: "Search", mr: "शोधा" },
  submit: { en: "Submit", mr: "सादर करा" },
  register: { en: "Register", mr: "नोंदणी करा" },
  edit: { en: "Edit", mr: "संपादित करा" },
  delete: { en: "Delete", mr: "हटवा" },
  view: { en: "View", mr: "पहा" },
  view_profile: { en: "View Profile", mr: "प्रोफाइल पहा" },
  loading: { en: "Loading...", mr: "लोड होत आहे..." },
  all: { en: "All", mr: "सर्व" },
  yes: { en: "Yes", mr: "होय" },
  no: { en: "No", mr: "नाही" },
  actions: { en: "Actions", mr: "क्रिया" },
  print: { en: "Print", mr: "मुद्रित करा" },
  download: { en: "Download", mr: "डाउनलोड करा" },

  // ─── AUTH ───
  login: { en: "Login", mr: "लॉगिन" },
  logout: { en: "Logout", mr: "लॉगआउट" },
  otp: { en: "OTP", mr: "ओटीपी" },
  send_otp: { en: "Send OTP", mr: "ओटीपी पाठवा" },
  resend_otp: { en: "Resend OTP", mr: "ओटीपी पुन्हा पाठवा" },
  verify: { en: "Verify", mr: "पडताळणी करा" },
  verifying: { en: "Verifying...", mr: "पडताळणी होत आहे..." },
  verify_login: { en: "Verify & Login", mr: "पडताळणी करा आणि लॉगिन करा" },
  mobile_number: { en: "Mobile Number", mr: "मोबाईल नंबर" },
  enter_otp: { en: "Enter OTP", mr: "ओटीपी प्रविष्ट करा" },
  otp_sent: { en: "OTP Sent", mr: "ओटीपी पाठवला" },
  otp_sent_to: { en: "OTP sent to", mr: "ओटीपी पाठवला" },
  resend_in: { en: "Resend in", mr: "पुन्हा पाठवा" },
  seconds: { en: "seconds", mr: "सेकंद" },

  // ─── DASHBOARD SIDEBAR ───
  dashboard: { en: "Dashboard", mr: "डॅशबोर्ड" },
  admin_dashboard: { en: "Admin Dashboard", mr: "प्रशासकीय डॅशबोर्ड" },
  citizen_dashboard: { en: "My Dashboard", mr: "माझा डॅशबोर्ड" },
  family_management: { en: "Family Management", mr: "कुटुंब व्यवस्थापन" },
  all_families: { en: "All Families", mr: "सर्व कुटुंब" },
  add_family: { en: "Add Family", mr: "कुटुंब जोडा" },
  tax_management: { en: "Tax Management", mr: "कर व्यवस्थापन" },
  applications: { en: "Applications", mr: "अर्ज" },
  certificates: { en: "Certificates", mr: "दाखले" },
  notices: { en: "Notices", mr: "सूचना" },
  news: { en: "News", mr: "बातम्या" },
  development_works: { en: "Development Works", mr: "विकास कामे" },
  site_settings: { en: "Site Settings", mr: "साइट सेटिंग्ज" },
  executive_board: { en: "Executive Board", mr: "कार्यकारी मंडळ" },
  government_officials: { en: "Government Officials", mr: "शासकीय अधिकारी" },
  print_qr: { en: "Print QR Cards", mr: "QR कार्ड मुद्रित करा" },

  // ─── FAMILY ───
  family_id: { en: "Family ID", mr: "कुटुंब ID" },
  house_number: { en: "House No.", mr: "घर क्रमांक" },
  head_name: { en: "Head of Family", mr: "कुटुंब प्रमुख" },
  total_members: { en: "Total Members", mr: "एकूण सदस्य" },
  men: { en: "Men", mr: "पुरुष" },
  women: { en: "Women", mr: "महिला" },
  seniors: { en: "Senior Citizens", mr: "ज्येष्ठ नागरिक" },
  children: { en: "Children (0–18)", mr: "बालके (0–18)" },
  mobile: { en: "Mobile", mr: "मोबाईल" },
  whatsapp: { en: "WhatsApp", mr: "व्हॉट्सॲप" },
  address: { en: "Address", mr: "पत्ता" },
  family_registered: { en: "Family Registered", mr: "कुटुंब नोंदणी यशस्वी" },
  search_household: { en: "Search Household", mr: "कुटुंब शोधा" },
  search_household_placeholder: { en: "Enter name / mobile / family ID...", mr: "नाव / मोबाईल नंबर / कुटुंब ID प्रविष्ट करा..." },
  no_families_found: { en: "No families found.", mr: "कोणतेही कुटुंब सापडले नाही." },
  view_all_families: { en: "View All Families", mr: "सर्व कुटुंबे पहा" },
  registered_families: { en: "All Registered Households", mr: "सर्व नोंदणीकृत कुटुंबे" },
  qr_code: { en: "QR Code", mr: "QR कोड" },

  // ─── TAXES ───
  tax_bills: { en: "Tax Bills", mr: "कर देयके" },
  water_tax: { en: "Water Tax (General + Special)", mr: "पाणीपट्टी (सामान्य + विशेष)" },
  house_tax: { en: "House + Health + Electricity Tax", mr: "घरपट्टी + आरोग्य कर + वीज कर" },
  fine: { en: "Fine / Penalty", mr: "दंड" },
  all_fines: { en: "All Fines / Penalties", mr: "सर्व दंड" },
  total_due: { en: "Total Due", mr: "एकूण देय" },
  current_year: { en: "Current Year", mr: "चालू वर्ष" },
  previous_dues: { en: "Previous Year Dues", mr: "मागील वर्षांची थकबाकी" },
  total_payable: { en: "Total Payable", mr: "एकूण देय रक्कम" },
  paid: { en: "Paid", mr: "भरलेले" },
  pending: { en: "Pending", mr: "थकीत" },
  partial: { en: "Partial", mr: "अंशतः भरलेले" },
  pay_now: { en: "Pay Now", mr: "आता भरा" },
  pay_online: { en: "Pay Online", mr: "ऑनलाइन भरा" },
  nothing_to_pay: { en: "Nothing to Pay", mr: "भरायचे काहीही नाही" },
  processing: { en: "Processing...", mr: "प्रक्रिया होत आहे..." },
  enter_amount: { en: "Enter amount", mr: "रक्कम प्रविष्ट करा" },
  assign_tax: { en: "Assign Tax", mr: "कर आकारा" },
  tax_type: { en: "Tax Type", mr: "कर प्रकार" },
  amount: { en: "Amount", mr: "रक्कम" },
  year: { en: "Year", mr: "वर्ष" },
  fine_reason: { en: "Reason for Fine", mr: "दंड कारण" },
  view_fine_reason: { en: "View Fine Reason", mr: "दंड कारण पहा" },
  payment_history: { en: "Payment History", mr: "भरणा इतिहास" },
  no_bills: { en: "No tax bills found.", mr: "कोणतेही कर बिल आढळले नाही." },
  mark_offline: { en: "Mark as Offline Payment", mr: "ऑफलाइन भरणा म्हणून नोंदवा" },
  generate_receipt: { en: "Generate Receipt", mr: "पावती तयार करा" },

  // ─── CERTIFICATE TYPES ───
  birth_certificate: { en: "Birth Certificate", mr: "जन्म दाखला" },
  death_certificate: { en: "Death Certificate", mr: "मृत्यू दाखला" },
  income_certificate: { en: "Income Certificate", mr: "उत्पन्न दाखला" },
  marriage_certificate: { en: "Marriage Certificate", mr: "विवाह दाखला" },
  residence_certificate: { en: "Residence Certificate", mr: "रहिवासी दाखला" },

  // ─── APPLICATIONS ───
  application: { en: "Application", mr: "अर्ज" },
  my_applications: { en: "My Applications", mr: "माझे अर्ज" },
  application_status: { en: "Application Status", mr: "अर्जांची स्थिती" },
  applicant_name: { en: "Applicant Name", mr: "अर्जदाराचे नाव" },
  application_date: { en: "Application Date", mr: "अर्ज तारीख" },
  completed_at: { en: "Completed At", mr: "पूर्ण वेळ" },
  status: { en: "Status", mr: "स्थिती" },
  remark: { en: "Remarks", mr: "शेरा" },
  no_applications: { en: "No applications found.", mr: "कोणताही अर्ज सापडला नाही." },
  apply_certificate: { en: "Apply for Certificate", mr: "दाखल्यासाठी अर्ज करा" },
  edit_application: { en: "Edit Application", mr: "अर्ज संपादित करा" },
  save_changes: { en: "Save Changes", mr: "बदल जतन करा" },
  type_pending: { en: "Pending", mr: "प्रलंबित" },
  type_completed: { en: "Completed", mr: "पूर्ण" },
  type_need_docs: { en: "Need Documents", mr: "कागदपत्रे आवश्यक" },
  update_status: { en: "Update Status", mr: "स्थिती अद्यतनित करा" },
  upload_certificate: { en: "Upload Certificate", mr: "दाखला अपलोड करा" },
  view_download: { en: "View / Download", mr: "पहा / डाउनलोड" },

  // ─── QR PAGE ───
  scan_success: { en: "Scan Successful!", mr: "स्कॅन यशस्वी!" },
  qr_verified: { en: "QR Verified", mr: "QR सत्यापित" },
  qr_recognized: { en: "QR Code securely recognized", mr: "QR कोड सुरक्षितपणे ओळखला गेला" },
  household_profile: { en: "Household Profile", mr: "कुटुंब माहिती" },
  go_website: { en: "Go to Main Website", mr: "मुख्य वेबसाईटवर जा" },
  pay_taxes: { en: "Pay Taxes", mr: "करांचा भरणा करा" },
  sending_otp: { en: "Sending OTP...", mr: "ओटीपी पाठवत आहे..." },
  otp_verification: { en: "OTP Verification", mr: "मोबाईल पडताळणी" },
  otp_sent_msg: { en: "OTP sent to registered mobile", mr: "नोंदणीकृत मोबाईलवर ओटीपी पाठवला" },
  verify_pay: { en: "Verify & Pay", mr: "पडताळणी करा" },
  go_dashboard: { en: "Go to Dashboard", mr: "डॅशबोर्डवर जा" },
  pay_total: { en: "Pay All Dues", mr: "सर्व थकबाकी भरा" },
  all_paid: { en: "All taxes paid", mr: "सर्व कर भरलेले आहेत" },

  // ─── NOTIFICATIONS ───
  notifications: { en: "Notifications", mr: "सूचना" },
  no_notifications: { en: "No notifications.", mr: "कोणतीही सूचना नाही." },
  mark_read: { en: "Mark as Read", mr: "वाचले म्हणून नोंदवा" },

  // ─── PUBLIC WEBSITE ───
  home: { en: "Home", mr: "मुख्यपृष्ठ" },
  about: { en: "About", mr: "परिचय" },
  services: { en: "Services", mr: "सेवा" },
  contact: { en: "Contact", mr: "संपर्क" },
  citizen_login: { en: "Citizen Login", mr: "नागरिक लॉगिन" },
  admin_login: { en: "Admin Login", mr: "प्रशासक लॉगिन" },
  maharashtra_govt: { en: "Government of Maharashtra", mr: "महाराष्ट्र शासन" },
  grampanchayat: { en: "Gram Panchayat", mr: "ग्रामपंचायत" },
  apply_online: { en: "Apply Online", mr: "ऑनलाइन अर्ज करा" },
  click_for_info: { en: "Click for more information", mr: "माहितीसाठी येथे क्लिक करा" },
  village_household_hub: { en: "Village Household Hub", mr: "ग्रामीण कुटुंब केंद्र" },

  // ─── ADMIN TABS ───
  tab_search: { en: "Search", mr: "शोध" },
  tab_all: { en: "All Families", mr: "सर्व कुटुंब" },
  tab_add: { en: "Register New", mr: "नवीन नोंदणी" },
  tab_ledger: { en: "Tax Ledger", mr: "कर खातेवही" },
  tab_overview: { en: "Overview", mr: "सारांश" },
  tab_stats: { en: "Statistics", mr: "आकडेवारी" },

  // ─── STATS ───
  total_families: { en: "Total Families", mr: "एकूण कुटुंबे" },
  total_population: { en: "Total Population", mr: "एकूण लोकसंख्या" },
  pending_dues: { en: "Pending Dues", mr: "थकबाकी" },
  total_collected: { en: "Total Collected", mr: "एकूण वसुली" },

  // ─── RECEIPTS ───
  receipt: { en: "Receipt", mr: "पावती" },
  transaction_id: { en: "Transaction ID", mr: "व्यवहार ID" },
  payment_method: { en: "Payment Method", mr: "भरणा पद्धत" },
  offline: { en: "Offline", mr: "ऑफलाइन" },
  online: { en: "Online", mr: "ऑनलाइन" },
  payment_date: { en: "Payment Date", mr: "भरणा तारीख" },
};

// Helper to get certificate type name
export const getCertificateTypeName = (type, lang) => {
  const map = {
    birth: { en: "Birth Certificate", mr: "जन्म दाखला" },
    death: { en: "Death Certificate", mr: "मृत्यू दाखला" },
    income: { en: "Income Certificate", mr: "उत्पन्न दाखला" },
    marriage: { en: "Marriage Certificate", mr: "विवाह दाखला" },
    residence: { en: "Residence Certificate", mr: "रहिवासी दाखला" },
  };
  return map[type]?.[lang] || map[type]?.["en"] || type;
};

// Helper for tax type names
export const getTaxTypeName = (type, lang) => {
  const map = {
    samanya_water: { en: "General Water Tax", mr: "सामान्य पाणीपट्टी" },
    vishesh_water: { en: "Special Water Tax", mr: "विशेष पाणीपट्टी" },
    house: { en: "House Tax", mr: "घरपट्टी" },
    health: { en: "Health Tax", mr: "आरोग्य कर" },
    electricity: { en: "Electricity Tax", mr: "वीज कर" },
    fine: { en: "Fine / Penalty", mr: "दंड" },
  };
  return map[type]?.[lang] || map[type]?.["en"] || type;
};

// Helper for application status
export const getStatusLabel = (status, lang) => {
  const map = {
    pending: { en: "Pending", mr: "प्रलंबित" },
    completed: { en: "Completed", mr: "पूर्ण" },
    need_documents: { en: "Need Documents", mr: "कागदपत्रे आवश्यक" },
  };
  return map[status]?.[lang] || status;
};
