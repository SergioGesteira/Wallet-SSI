import React from 'react';
import { Container, Typography, Card, Grid, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UniversityDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleRedirectToIssue = () => {
    navigate('/university-issue');
  };

  return (
    <Container maxWidth="lg" sx={{ marginTop: '4rem' }}>
      {/* Header Section */}
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        Welcome to your Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" align="center" gutterBottom>
        Explore the latest updates, resources, and information about our university.
      </Typography>

      {/* Redirect to Issue Button */}
      <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Don't have a verifiable credential yet? Our university now issues them for SSI purposes!
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center" gutterBottom>
          If you don't have a verifiable credential that demonstrates that your are a student from this university yet, click the button below to apply for one.
          Your application will be reviewed and processed by the university.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleRedirectToIssue}
          sx={{ marginTop: '1rem', paddingY: '0.75rem', fontSize: '1rem' }}
        >
          Get Your Credential
        </Button>
      </Box>

      {/* Announcements Section */}
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Latest Announcements
        </Typography>
        <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
          <Typography variant="body1">
            <strong>Spring Semester Registration:</strong> Registration for Spring 2024 starts on January 5th.
          </Typography>
          <Typography variant="body1" sx={{ marginTop: '1rem' }}>
            <strong>Workshop:</strong> Join us for a workshop on AI and Machine Learning on February 15th.
          </Typography>
        </Card>
      </Box>

      {/* Courses Offered Section */}
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Courses Offered
        </Typography>
        <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f0f4f8' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Computer Science:</strong> B.Sc., M.Sc., Ph.D.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Business Administration:</strong> BBA, MBA
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">
                <strong>Mechanical Engineering:</strong> B.Tech., M.Tech., Ph.D.
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Departments Section */}
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Departments and Contacts
        </Typography>
        <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Computer Science Department:</strong> Dr. John Hernandez (Head)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Mechanical Engineering Department:</strong> Dr. Anthony Alarcon (Head)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Business Administration:</strong> Dr. Susan Alphons (Head)
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Library Section */}
      <Box sx={{ marginTop: '2rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Library Resources
        </Typography>
        <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f0f4f8' }}>
          <Typography variant="body1">
            Access our online library catalog and research tools. Visit the library for more information or explore the digital library portal.
          </Typography>
        </Card>
      </Box>

      {/* Campus Map Section */}
      <Box sx={{ marginTop: '2rem', marginBottom: '4rem' }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Campus Facilities and Map
        </Typography>
        <Card variant="outlined" sx={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
          <Typography variant="body1">
            Explore our state-of-the-art labs, hostels, sports facilities, and recreation centers. 
          </Typography>
          <Typography variant="body1" sx={{ marginTop: '1rem' }}>
            Download the <strong>campus map</strong> for navigation.
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default UniversityDashboard;