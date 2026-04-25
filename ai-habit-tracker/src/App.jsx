import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import HabitsList from './pages/HabitsList';
import AICoach from './pages/AICoach';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AuthPage from './pages/Login'; // ← your new combined component

// ✅ Reactive auth guard — re-checks token on every navigation
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* 🔓 PUBLIC — both /login and /signup use same AuthPage */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* 🔐 PROTECTED */}
        <Route path="/" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="habits" element={<HabitsList />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="coach" element={<AICoach />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;