import React, { useEffect } from 'react';
import { Container, Typography, Card, Grid, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const CongressWeb: React.FC = () => {
  const location = useLocation();

  const credential = location.state?.credential;
  const claims = location.state?.claims;

  const firstClaim = Array.isArray(claims) && claims.length > 0 ? claims[0] : null;

  useEffect(() => {
    if (!firstClaim) {
      toast.error('No credential data available.');
    } else {
      toast.success('Credential data loaded successfully.');
    }
  }, [firstClaim]);


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
        Welcome to the Congress Web Portal
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Card variant="outlined" sx={{ padding: '2rem', maxWidth: '80%', backgroundColor: '#f0f4f8' }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Participant Information
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
      <Box sx={{ textAlign: 'center', marginTop: '4rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Welcome Video
        </Typography>
        <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
          <video width="100%" controls>
            <source src="path/to/your/video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Card>
      </Box>
    </Container>
  );
};

export default CongressWeb;