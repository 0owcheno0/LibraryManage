import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, App as AntApp } from 'antd';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/common/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentListPage from './pages/documents/DocumentListPage';
import DocumentDetailPage from './pages/documents/DocumentDetailPage';
import TagManagementPage from './pages/tags/TagManagementPage';
import SearchPage from './pages/search/SearchPage';
import ProfilePage from './pages/user/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import ThemeTestPage from './pages/ThemeTestPage';

// 导入主题样式
import './styles/theme.css';

function App() {
  return (
    <ThemeProvider>
      <AntApp>
        <AuthProvider>
        <Layout style={{ minHeight: '100vh' }}>
          <Routes>
            {/* 公开路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 私有路由 */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="documents" element={<DocumentListPage />} />
              <Route path="documents/:id" element={<DocumentDetailPage />} />
              <Route path="tags" element={<TagManagementPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="theme-test" element={<ThemeTestPage />} />
            </Route>

            {/* 404重定向 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
        </AuthProvider>
      </AntApp>
    </ThemeProvider>
  );
}

export default App;
