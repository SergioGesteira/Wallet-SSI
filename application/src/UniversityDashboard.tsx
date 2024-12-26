import React from 'react';
import { Container, Typography, Card, Grid, Box } from '@mui/material';

const UniversityDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ marginTop: '4rem' }}>
      {/* Header Section */}
      <Typography variant="h4" color="primary" align="center" gutterBottom>
        Welcome to [University Name] Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" align="center" gutterBottom>
        Explore the latest updates, resources, and information about our university.
      </Typography>

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
                <strong>Computer Science Department:</strong> Dr. John Smith (Head)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Mechanical Engineering Department:</strong> Dr. Sarah Johnson (Head)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Business Administration:</strong> Dr. Emily Brown (Head)
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
