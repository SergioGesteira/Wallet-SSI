import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import StudentWeb from './StudentWeb';
import AdminPanel from './AdminPanel';
import UniversityIssue from './UniversityIssue';
import UniversityDashboard from './UniversityDashboard';
import ProtectedRoute from './ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} /> 
        <Route path="/university-issue" element={<UniversityIssue />} />
        <Route path="/student-web" element={<ProtectedRoute />}>
        <Route path="" element={<StudentWeb />} />
        </Route>
        <Route path="/dashboard" element={<UniversityDashboard />} />
      </Routes>
    </Router>
  );
};
export default App;