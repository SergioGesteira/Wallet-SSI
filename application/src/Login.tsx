// application/src/Login.tsx
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';

const Login: React.FC = () => {
  const [verifiablePresentation, setVerifiablePresentation] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const handleLogin = async () => {
    try {
      const nonce = await fetchNonce();
      if (!nonce) return;

      const response = await axios.post(
        'http://localhost:5000/verifyPresentation',
        { jwt: verifiablePresentation, nonce },
        { withCredentials: true }
      );

      console.log('credential:', response.data.credential);
        console.log('claims:', response.data.claims);
        console.log('didDocument:', response.data.didDocument);
      if (response.status === 200) {
        navigate('/student-web', { state: { credential: response.data.credential, claims: response.data.claims, didDocument: response.data.didDocument } });
    }
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(`Error: ${error.response?.data.message || 'Request failed'}`);
      } else {
        setMessage('An unexpected error occurred');
      }
      console.error('Error sending credential:', error);
    }
  };

  const handleRedirectToCredentialApp = () => {
    window.location.href = 'http://localhost:5000/redirectToCredentialApp';
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          University Login
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          Please paste your JWT verifiable presentation below
        </Typography>
        <TextField
          label="JWT Verifiable Presentation"
          placeholder="Paste the JWT of your verifiable presentation here"
          multiline
          rows={6}
          variant="outlined"
          fullWidth
          value={verifiablePresentation}
          onChange={(e) => setVerifiablePresentation(e.target.value)}
          sx={{ marginTop: '1.5rem' }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
        >
          Submit
        </Button>
        {message && <Typography color="error" sx={{ marginTop: '1rem' }}>{message}</Typography>}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleRedirectToCredentialApp}
          sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
        >
        Don't have a credential yet?
        </Button>
      </Paper>
    </Container>
  );
};

export default Login;
