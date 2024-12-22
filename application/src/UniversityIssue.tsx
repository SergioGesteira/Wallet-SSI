import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UniversityIssue: React.FC = () => {
  const [did, setDid] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [jwt, setJwt] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/university/sendDid', { did });
      setResponse(res.data);
      setStatusMessage('University is reviewing your application.');
      toast.success('DID submitted successfully.');
    } catch (error) {
      console.error('Error sending DID:', error);
      toast.error('Error sending DID. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchStoredJwt = async () => {
      try {
        const res = await axios.get('http://localhost:5000/university/getStoredJwt');
        if (res.data.success) {
          setJwt(res.data.jwt);
          setStatusMessage('Your application has been approved. Here is your JWT:');
        }
      } catch (error) {
        console.error('Error fetching stored JWT:', error);
      }
    };

    const interval = setInterval(fetchStoredJwt, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          University Issue
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="DID"
            placeholder="Enter your DID"
            variant="outlined"
            fullWidth
            value={did}
            onChange={(e) => setDid(e.target.value)}
            sx={{ marginTop: '1.5rem' }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
          >
            Submit
          </Button>
        </form>
        {statusMessage && (
          <Typography variant="h6" align="center" color="textSecondary" sx={{ marginTop: '1.5rem' }}>
            {statusMessage}
          </Typography>
        )}
        {jwt && (
          <div>
            <Typography variant="h5" align="center" gutterBottom>
              JWT:
            </Typography>
            <pre>{jwt}</pre>
          </div>
        )}
      </Paper>
      <ToastContainer />
    </Container>
  );
};

export default UniversityIssue;