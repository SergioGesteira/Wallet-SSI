import React, { useState , useEffect} from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify'; // Import React Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const acceptedIssuers = [
  'EETAC (did:ethr:sepolia:0x6E3Eee05f2B947008DdF6f2f7765D10Cb8Ea5F83)',
  'ETSETB (did:ethr:sepolia:0xfA82488EFfc00b09291f6e3A894887C55892Fd69)'
];

const CongressLogin: React.FC = () => {
  const [verifiablePresentation, setVerifiablePresentation] = useState(''); // Stores the user's verifiable presentation JWT
  const [isLoading, setIsLoading] = useState(false); // Loading state for UI feedback
  const [isFormVisible, setIsFormVisible] = useState(false); // Controls visibility of the login form
  const [nonce, setNonce] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the nonce from the server when the component mounts
    const fetchNonce = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getNonce', { withCredentials: true });
        setNonce(response.data.nonce);
      } catch (error) {
        console.error('Error fetching nonce:', error);
        toast.error('Error fetching nonce. Please try again later.');
      }
    };

    fetchNonce();
  }, []);
  

  // Handles the login process
  const handleLogin = async () => {
    setIsLoading(true);
    try {
  
        // if (!nonce) return;
      const response = await axios.post(
        'http://localhost:5000/verifyPresentation',
        // { jwt: verifiablePresentation, nonce: nonce },
        { jwt: verifiablePresentation },
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


  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
        Congress Web Login
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

        <Typography variant="h6" align="center" sx={{ marginTop: '2rem' }}>
  We only accept credentials from these issuers:
</Typography>
<ul style={{ listStyleType: 'none', padding: 0, margin: '1rem 0', textAlign: 'center' }}>
  {acceptedIssuers.map((issuer, index) => (
    <li key={index} style={{ margin: '0.5rem 0', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9', wordBreak: 'break-all'  }}>
      <Typography variant="body1" align="center"sx={{ wordBreak: 'break-all' }}>
        {issuer}
      </Typography>
    </li>
  ))}
</ul>
<Typography variant="h6" align="center" sx={{ marginTop: '2rem' }}>
  Nonce for this session: {nonce}
</Typography>
</Paper>
<ToastContainer />
</Container>
);
};

export default CongressLogin;
