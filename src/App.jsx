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
import ELibraryPage from './Pages/ELibraryPage.jsx';
import ReadBookPage from './Pages/ReadBookPage.jsx';
import ELibraryAdminDashboard from './Pages/ELibraryAdminDashboard.jsx';

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

            {/* Standalone eLibrary pages */}
            <Route
              path="/admin/elibrary-dashboard"
              element={
                <RequireAuth>
                  <ELibraryAdminDashboard />
                </RequireAuth>
              }
            />
            <Route path="/elibrary" element={<ELibraryPage />} />
            <Route path="/elibrary/read/:id" element={<ReadBookPage />} />
          </Routes>
        </Router>
      </SiteConfigProvider>
    </LanguageProvider>
  );
}

export default App;

