import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Import panel components
import StudentPanel from './student-panel/App.jsx';
import AdminPanel from './admin-panel/App.jsx';
import TeacherPanel from './teacher-panel/App.jsx';
import Login from './login/Login.jsx';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (loginData) => {
    try {
      console.log('Sending login request:', loginData);
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Response status:', response.status, response.ok);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setIsAuthenticated(true);
        setUserRole(loginData.role);
        // Store the token in localStorage for API calls
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        // Get the name from the response data, fallback to form data, then to role name
        const name = data.user?.name || data.name || loginData.name || loginData.role.charAt(0).toUpperCase() + loginData.role.slice(1);
        console.log('Login response data:', data);
        console.log('Extracted user name:', name);
        setUserName(name);

        // Redirect directly to the appropriate panel based on role
        if (loginData.role === 'student') {
          navigate('/students/dashboard');
        } else if (loginData.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (loginData.role === 'admin') {
          navigate('/admin');
        }

        return { success: true, message: 'Login successful' };
      } else {
        console.log('Login failed:', data);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/students/*" element={isAuthenticated ? <StudentPanel onLogout={handleLogout} userName={userName || 'Student'} /> : <Navigate to="/" replace />} />
      <Route path="/admin/*" element={isAuthenticated ? <AdminPanel onLogout={handleLogout} userName={userName || 'Admin'} /> : <Navigate to="/" replace />} />
      <Route path="/teacher/*" element={isAuthenticated ? <TeacherPanel onLogout={handleLogout} userName={userName || 'Teacher'} /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
