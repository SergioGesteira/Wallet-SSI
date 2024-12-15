import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Paper, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';
import { issueCredential } from './utils'; 

// Importa la función para crear el agente de Veramo
import { createVeramoAgent } from './veramoAgent';  // Asegúrate de que la ruta sea correcta
import { Web3KeyManagementSystem } from '@veramo/kms-web3';

// Extiende la interfaz de Window para incluir la propiedad ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

const AdminPanel: React.FC = () => {
  const [pendingDIDs, setPendingDIDs] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [agent, setAgent] = useState<any>(null);  // Almacenará el agente de Veramo

  useEffect(() => {
    // Función para obtener los DIDs pendientes
    const fetchPendingDIDs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/university/pendingDIDs');
        setPendingDIDs(res.data.pendingDIDs);
      } catch (error) {
        console.error('Error fetching pending DIDs:', error);
        toast.error('Error fetching pending DIDs. Please try again later.');
      }
    };

    fetchPendingDIDs();
  }, []);

  const connectToMetamask = async () => {
    if (!window.ethereum) {
      toast.error('Metamask no está instalado. Por favor, instala Metamask.');
      return null;
    }

    try {
      console.log('Solicitando cuentas...');
      const provider = new ethers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);  // Solicita las cuentas al usuario
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('Dirección de la cuenta:', address);
      return { provider, signer, address };
    } catch (error) {
      console.error('Error al conectar con Metamask:', error);
      toast.error('Error al conectar con Metamask. Por favor, intenta nuevamente.');
      return null;
    }
  };

  // Función que se ejecuta cuando el usuario aprueba un DID
  const handleApprove = async (did: string) => {
    const connection = await connectToMetamask();
    if (!connection) {
      return;
    }

    const { provider, signer, address } = connection;

    // Crea el agente de Veramo con la información de conexión
    const kms = new Web3KeyManagementSystem({ signer });
    const veramoAgent = await createVeramoAgent(kms, provider);

    setAgent(veramoAgent);  // Almacena el agente de Veramo

    try {
      // Llamada para aprobar el DID (esto es solo un ejemplo, ajusta según tu lógica)
      const res = await axios.post('http://localhost:5000/university/approveDid', { did, address });
      setMessage(res.data.message);
      setPendingDIDs(pendingDIDs.filter(d => d !== did));
      toast.success(`DID ${did} approved successfully.`);

      // Aquí podrías agregar lógica adicional para usar el agente Veramo, por ejemplo,
      // firmar una Verifiable Credential, generar una Presentation, etc.
      
    } catch (error) {
      console.error('Error approving DID:', error);
      toast.error('Error approving DID. Please try again later.');
    }
  };

  // Función que se ejecuta cuando el usuario rechaza un DID
  const handleReject = async (did: string) => {
    try {
      const res = await axios.post('http://localhost:5000/university/rejectDid', { did });
      setMessage(res.data.message);
      setPendingDIDs(pendingDIDs.filter(d => d !== did));
      toast.success(`DID ${did} rejected successfully.`);
    } catch (error) {
      console.error('Error rejecting DID:', error);
      toast.error('Error rejecting DID. Please try again later.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: '4rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Admin Panel
        </Typography>
        {message && <Typography variant="body1" color="textSecondary" align="center">{message}</Typography>}
        <List>
          {pendingDIDs.map(did => (
            <ListItem key={did}>
              <ListItemText primary={did} />
              <ListItemSecondaryAction>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleApprove(did)}
                  sx={{ marginRight: '1rem' }}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleReject(did)}
                >
                  Reject
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      <ToastContainer />
    </Container>
  );
};

export default AdminPanel;
