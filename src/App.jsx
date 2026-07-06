import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './Pages/MainPage.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import RequireAuth from './Components/RequireAuth.jsx';
import { SiteConfigProvider } from './utils/SiteConfigContext.jsx';
import { LanguageProvider } from './utils/LanguageContext.jsx';
import './App.css';

// New VMS pages
import UserLoginPage from './Pages/UserLoginPage.jsx';

import UserDashboard from './Pages/UserDashboard.jsx';
import QrPartialPage from './Pages/QrPartialPage.jsx';

// eLibrary pages
import ELibraryLayout from './eLibrary/ELibraryLayout.jsx';
import ELibDashboard from './eLibrary/pages/Dashboard.jsx';
import ELibBooks from './eLibrary/pages/Books.jsx';
import ELibUpload from './eLibrary/pages/UploadBook.jsx';
import ELibDownloads from './eLibrary/pages/Downloads.jsx';
import ELibSettings from './eLibrary/pages/Settings.jsx';
import ELibRead from './eLibrary/pages/ReadBook.jsx';

function App() {
  return (
    <LanguageProvider>
      <SiteConfigProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route path="/user-login" element={<UserLoginPage />} />

            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/qr-partial" element={<QrPartialPage />} />

            {/* eLibrary portal nested routes */}
            <Route path="/elibrary" element={<ELibraryLayout />}>
              <Route index element={<ELibDashboard />} />
              <Route path="books" element={<ELibBooks />} />
              <Route path="upload" element={<ELibUpload />} />
              <Route path="downloads" element={<ELibDownloads />} />
              <Route path="settings" element={<ELibSettings />} />
              <Route path="read/:id" element={<ELibRead />} />
            </Route>
          </Routes>
        </Router>
      </SiteConfigProvider>
    </LanguageProvider>
  );
}

export default App;

