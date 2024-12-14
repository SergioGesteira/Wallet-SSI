import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UniversityIssue: React.FC = () => {
  const [did, setDid] = useState<string>('');
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/university/sendDid', { did });
      setResponse(res.data);
      toast.success('DID submitted successfully.');
    } catch (error) {
      console.error('Error sending DID:', error);
      toast.error('Error sending DID. Please try again later.');
    }
  };

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
        {response && (
          <div>
            <Typography variant="h5" align="center" gutterBottom>
              Response:
            </Typography>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </Paper>
      <ToastContainer />
    </Container>
  );
};

export default UniversityIssue;