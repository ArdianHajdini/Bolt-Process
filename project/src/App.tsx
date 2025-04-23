import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProcessProvider } from './context/ProcessContext';
import { DepartmentProvider } from './context/DepartmentContext';
import Layout from './components/layout/Layout';
import {
  LoginPage,
  Dashboard,
  ProcessBuilder,
  ProcessView,
  TemplatesPage,
  TasksPage,
  DepartmentsPage
} from './pages';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DepartmentProvider>
        <ProcessProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/templates" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TemplatesPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/process/new" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProcessBuilder />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/process/edit/:id" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProcessBuilder />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/process/:id" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProcessView />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TasksPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/departments" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DepartmentsPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ProcessProvider>
      </DepartmentProvider>
    </AuthProvider>
  );
};

export default App;