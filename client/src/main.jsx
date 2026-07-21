import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import StaffLiveboard from './pages/StaffLiveboard.jsx';
import StaffTeam from './pages/StaffTeam.jsx';
import StaffAnalytics from './pages/StaffAnalytics.jsx';
import Landing from './pages/Landing.jsx';
import PatientIntake from './pages/PatientIntake.jsx';
import StaffGuard from './components/StaffGuard.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/intake" element={<PatientIntake />} />
        <Route path="/board" element={<App />} />
        <Route path="/staff" element={<StaffGuard><StaffLiveboard /></StaffGuard>} />
        <Route path="/staff/team" element={<StaffGuard><StaffTeam /></StaffGuard>} />
        <Route path="/staff/analytics" element={<StaffGuard><StaffAnalytics /></StaffGuard>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
