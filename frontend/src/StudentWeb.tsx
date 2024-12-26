import React, { useEffect } from 'react';
import { Container, Typography, Card, Grid, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentWeb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const credential = location.state?.credential;
  const claims = location.state?.claims;

  
  console.log('Location state:', location.state); // Debugging statement
  console.log('Credential:', credential); // Debugging statement
  console.log('Claims:', claims); // Debugging statement

  const firstClaim = Array.isArray(claims) && claims.length > 0 ? claims[0] : null;

 
    // Show a notification based on whether claim data is available
    useEffect(() => {
        if (!firstClaim) {
            toast.error('No credential data available.'); // Show error if no claim data
        } else {
            toast.success('Credential data loaded successfully.'); // Success notification if data is available
        }
    }, [firstClaim]);


  const handleNavigateToDashboard = () => {
    navigate('/dashboard', { state: { credential, claims } });
  };


  if (!credential || !claims) {
    return (
      <Container maxWidth="md" sx={{ marginTop: '4rem', textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          No credential data available.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: '4rem' }}>
      <Typography variant="h4" color="primary" gutterBottom align="center">
        Welcome to Your University Portal
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Card variant="outlined" sx={{ padding: '2rem', maxWidth: '80%', backgroundColor: '#f0f4f8' }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Student Information
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(firstClaim).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Typography variant="body1" color="textPrimary">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Box>

      <Typography variant="h5" color="primary" gutterBottom align="center">
        Verifiable Credential
      </Typography>

      <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px', color: '#333' }}>
          {JSON.stringify(credential, null, 2)}
        </pre>
      </Card>

      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Button variant="contained" color="primary" onClick={handleNavigateToDashboard} sx={{ marginTop: '1rem' }}>
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default StudentWeb;
