import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UniversityLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
    //   const response = await axios.post('http://localhost:5000/login', { username, password });
    //   if (response.status === 200) {
        toast.success('Login successful!');
        navigate('/dashboard');
      //}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          University Login
        </Typography>
        <Typography variant="body1" color="textSecondary" align="center">
          Please enter your username and password to login
        </Typography>
        <TextField
          label="Username"
          placeholder="Enter your username"
          variant="outlined"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ marginTop: '1.5rem' }}
        />
        <TextField
          label="Password"
          type="password"
          placeholder="Enter your password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginTop: '1.5rem' }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
          sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </Paper>
      <ToastContainer />
    </Container>
  );
};

export default UniversityLogin;