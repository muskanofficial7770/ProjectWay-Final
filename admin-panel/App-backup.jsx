import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ManageTeachers from './pages/ManageTeachers.jsx';
import ManageStudents from './pages/ManageStudents.jsx';
import RolesPermissions from './pages/RolesPermissions.jsx';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/teachers" element={
          <Layout>
            <ManageTeachers />
          </Layout>
        } />
        <Route path="/students" element={
          <Layout>
            <ManageStudents />
          </Layout>
        } />
        <Route path="/roles" element={
          <Layout>
            <RolesPermissions />
          </Layout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
