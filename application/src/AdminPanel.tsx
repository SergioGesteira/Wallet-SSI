import React, { useState, useEffect } from 'react';


import axios from 'axios';
import { Container, Typography, Button, Paper, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ethers } from 'ethers';

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}

const AdminPanel: React.FC = () => {
  const [pendingDIDs, setPendingDIDs] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Solicita las cuentas al usuario
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('Dirección de la cuenta:', address);
      return address;
    } catch (error) {
      console.error('Error al conectar con Metamask:', error);
      toast.error('Error al conectar con Metamask. Por favor, intenta nuevamente.');
      return null;
    }
  };
  const handleApprove = async (did: string) => {
    const address = await connectToMetamask();
    if (!address) {
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/university/approveDid', { did, address });
      setMessage(res.data.message);
      setPendingDIDs(pendingDIDs.filter(d => d !== did));
      toast.success(`DID ${did} approved successfully.`);
    } catch (error) {
      console.error('Error approving DID:', error);
      toast.error('Error approving DID. Please try again later.');
    }
  };

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