// application/src/Login.tsx
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

const Login: React.FC = () => {
  const [verifiablePresentation, setverifiablePresentation] = useState('');
  const [message, setMessage] = useState('');


  const fetchNonce = async (): Promise<string | null> => {
    try {
      const response = await axios.get<{ nonce: string }>('http://localhost:5000/getNonce', {
        withCredentials: true,
      });
      return response.data.nonce;
    } catch (error) {
      console.error('Error fetching nonce:', error);
      setMessage('Error fetching nonce');
      return null;
    }
  };
  // Manejar el envío del formulario
  const handleLogin = async () => {
    try {
      const nonce = await fetchNonce();
      if (!nonce) return;

      const response = await axios.post(
        'http://localhost:5000/verifyPresentation',
        {
          jwt: verifiablePresentation,  // Replace with actual JWT
          nonce,
        },
        { withCredentials: true }
      );

      setMessage(response.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(`Error: ${error.response?.data.message || 'Request failed'}`);
      } else {
        setMessage('An unexpected error occurred');
      }
      console.error('Error sending credential:', error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Enter JWT Token"
        value={verifiablePresentation}
        onChange={(e) => setverifiablePresentation(e.target.value)}
      />
      <button onClick={handleLogin}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
