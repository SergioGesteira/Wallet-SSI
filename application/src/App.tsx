import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import StudentWeb from './StudentWeb';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student-web" element={<StudentWeb />} />
      </Routes>
    </Router>
  );
};

export default App;
