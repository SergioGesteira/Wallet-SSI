// application/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import StudentWeb from './StudentWeb';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student-web" element={<ProtectedRoute />}>
          <Route path="" element={<StudentWeb />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;