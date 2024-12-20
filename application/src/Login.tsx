import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify'; // Import React Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const Login: React.FC = () => {
  const [verifiablePresentation, setVerifiablePresentation] = useState(''); // Stores the user's verifiable presentation JWT
  const [isLoading, setIsLoading] = useState(false); // Loading state for UI feedback
  const [isFormVisible, setIsFormVisible] = useState(false); // Controls visibility of the login form
  const navigate = useNavigate();

  // Function to fetch a unique nonce from the server
  const fetchNonce = async (): Promise<string | null> => {
    try {
      const response = await axios.get<{ nonce: string }>('http://localhost:5000/getNonce', {
        withCredentials: true,
      });
      return response.data.nonce;
    } catch (error) {
      console.error('Error fetching nonce:', error);
      toast.error('Error fetching nonce. Please try again later.'); // Error notification
      return null;
    }
  };

  // Handles the login process
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const nonce = await fetchNonce(); // Fetch nonce from server
      if (!nonce) return;

      // Send the JWT verifiable presentation and nonce to server for verification
      const response = await axios.post(
        'http://localhost:5000/verifyPresentation',
        { jwt: verifiablePresentation, nonce },
        { withCredentials: true }
      );

      // If the server returns a successful response, store the session token in local storage
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('jwtToken', token); // Store JWT token in local storage
        toast.success('Access granted! Welcome.'); // Success notification
        navigate('/student-web', { state: { credential: response.data.credential, claims: response.data.claims, didDocument: response.data.didDocument } });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || 'Request failed. Please try again later.'); // Error notification
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Redirects the user to the credential app to obtain a verifiable credential
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
          {isFormVisible ? 'Please paste your JWT verifiable presentation below' : 'Click to login with your verifiable credential'}
        </Typography>

        {/* Show the login button initially, then reveal the form on click */}
        {!isFormVisible ? (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setIsFormVisible(true)} // Reveal the form
            sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
          >
            Login with Verifiable Credential
          </Button>
        ) : (
          <>
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
          </>
        )}

        {/* Show loading spinner during credential verification */}
        {isLoading && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <CircularProgress />
            <Typography variant="body1" color="textSecondary" sx={{ marginTop: '1rem' }}>
              Verifying presentation...
            </Typography>
          </div>
        )}

        {/* Button to redirect the user to the credential app */}
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

      {/* Notification container */}
      <ToastContainer />
    </Container>
  );
};

export default Login;
