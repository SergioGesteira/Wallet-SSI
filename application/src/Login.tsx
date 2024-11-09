import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Paper, CircularProgress } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify'; // Importar React Toastify
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos de Toastify


const Login: React.FC = () => {
  const [verifiablePresentation, setVerifiablePresentation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false); // Control para mostrar el formulario
  const navigate = useNavigate();

  // Función para obtener el nonce
  const fetchNonce = async (): Promise<string | null> => {
    try {
      const response = await axios.get<{ nonce: string }>('http://localhost:5000/getNonce', {
        withCredentials: true,
      });
      return response.data.nonce;
    } catch (error) {
      console.error('Error fetching nonce:', error);
      toast.error('Error fetching nonce. Please try again later.'); // Notificación de error
      return null;
    }
  };

  // Manejo del login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const nonce = await fetchNonce();
      if (!nonce) return;

      const response = await axios.post(
        'http://localhost:5000/verifyPresentation',
        { jwt: verifiablePresentation, nonce },
        { withCredentials: true }
      );
            if (response.status === 200) {

      
        
          toast.success('Access granted! Welcome.'); // Notificación de éxito
          navigate('/student-web', { state: { credential: response.data.credential, claims: response.data.claims, didDocument: response.data.didDocument } });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || 'Request failed. Please try again later.'); // Notificación de error
      } else {
        toast.error('An unexpected error occurred. Please try again later.');
      }
      // console.error('Error sending credential:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirigir al usuario para obtener una credencial
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

        {/* Mostrar el botón para iniciar sesión y luego el formulario */}
        {!isFormVisible ? (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setIsFormVisible(true)} // Revela el formulario
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

        {/* Mostrar el spinner de carga */}
        {isLoading && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <CircularProgress />
            <Typography variant="body1" color="textSecondary" sx={{ marginTop: '1rem' }}>
              Verifying presentation...
            </Typography>
          </div>
        )}

        {/* Botón para redirigir al usuario a la aplicación de credenciales */}
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

      {/* Contenedor para las notificaciones */}
      <ToastContainer />
    </Container>
  );
};

export default Login;
