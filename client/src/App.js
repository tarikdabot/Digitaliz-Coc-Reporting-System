import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CandidatesProvider } from './context/CandidatesContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Toast from './components/Toast';
import { SidebarProvider } from './context/SidebarContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RegistrationPage from './pages/RegistrationPage';
import StudentListPage from './pages/StudentListPage';
import ByDeptPage from './pages/ByDeptPage';
import StatusPage from './pages/StatusPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 16, color: '#64748b' }}>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <CandidatesProvider>
            <SettingsProvider>
              <SidebarProvider>
                <Layout>
                  <Routes>
                    <Route path="/dashboard"           element={<Dashboard />} />
                    <Route path="/register"            element={<RegistrationPage />} />
                    <Route path="/students"            element={<StudentListPage />} />
                    <Route path="/by-dept"             element={<ByDeptPage />} />
                    <Route path="/status/:type"        element={<StatusPage />} />
                    <Route path="/report/:form"        element={<ReportPage />} />
                    <Route path="/settings"            element={<SettingsPage />} />
                    <Route path="/"                    element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
                <Toast />
              </SidebarProvider>
            </SettingsProvider>
          </CandidatesProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
