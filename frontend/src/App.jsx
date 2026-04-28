import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './components/Dashboard';
import MyExams from './components/MyExams';
import ClassForum from './components/ClassForum';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Nested Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } 
        >
          {/* Index route for /dashboard */}
          <Route index element={<Dashboard />} />
          {/* Nested routes: /dashboard/exams and /dashboard/forum */}
          <Route path="exams" element={<MyExams />} />
          <Route path="forum" element={<ClassForum />} />
        </Route>
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
