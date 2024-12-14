import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import StudentWeb from './StudentWeb';
import AdminPanel from './AdminPanel';
import UniversityIssue from './UniversityIssue';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component
// import { createAppKit } from '@reown/appkit/react';
// import { EthersAdapter } from '@reown/appkit-adapter-ethers';
// import { mainnet, sepolia } from '@reown/appkit/networks';

// declare global {
//   interface Window {
//     Buffer: typeof Buffer;
//   }
// }
// window.Buffer = Buffer;
// // 1. Get projectId
// const projectId: string = 'a5e2df042276815c407d0d9b04889f73';
// // 2. Set the networks
// const networks = [sepolia, mainnet];
// console.log('Networks: ', networks);

// const metadata = {
//   name: 'test',
//   description: 'My Website description',
//   url: 'http://localhost:5000', // origin must match your domain & subdomain
//   icons: ['https://avatars.mywebsite.com/'],
// };

// // 4. Create a AppKit instance
// createAppKit({
//   adapters: [new EthersAdapter()],
//   networks,
//   metadata,
//   projectId,
//   features: {
//     analytics: false, // Optional - defaults to your Cloud configuration
//     swaps: false, // Optional - defaults to your Cloud configuration
//     onramp: false, // Optional - defaults to your Cloud configuration
//     history: false, // Optional - defaults to your Cloud configuration
//   },
// });

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
      </Routes>
    </Router>
  );
};
export default App;