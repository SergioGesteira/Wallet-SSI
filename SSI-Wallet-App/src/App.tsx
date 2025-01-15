import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SSIWallet from './SSIWallet';
const App: React.FC = () => {


  return (
   
      <Router>
        <Routes>
          <Route path="" element={<SSIWallet />} />
        </Routes>
      </Router>
    );
}

export default App
