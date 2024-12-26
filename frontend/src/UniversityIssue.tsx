import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { createVeramoAgent } from './components/VeramoAgent';
import WalletConnection from './components/WalletConnection';
import AccountSelector from './components/AccountSelector';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { BrowserProvider } from 'ethers';
import { ManagedKeyInfo } from '@veramo/core';

const UniversityIssue: React.FC = () => {
  const [did, setDid] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [response, setResponse] = useState<unknown>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [jwt, setJwt] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resolvedDidDocument, setResolvedDidDocument] = useState<any>(null);
  const [kms, setKms] = useState<Web3KeyManagementSystem | null>(null);
  const [browserProvider, setBrowserProvider] = useState<BrowserProvider | null>(null);

  
  const [keys, setKeys] = useState<ManagedKeyInfo[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signer, setSigner] = useState<unknown>(null);
  const [selectedKey, setSelectedKey] = useState<ManagedKeyInfo | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!did.startsWith('did:')) {
      toast.error('Invalid DID format. Please enter a valid DID.');
      return;
    }
    
    try {
      const res = await axios.post('http://localhost:5000/university/sendDid', { did });
      setResponse(res.data);
      setStatusMessage('University is reviewing your application.');
      toast.success('DID submitted successfully.');
      await resolveDid(did); // Resolve DID after submitting
    } catch (error) {
      console.error('Error sending DID:', error);
      toast.error('Error sending DID. Please try again later.');
    }
  };

  const resolveDid = async (did: string) => {
    try {
      if (!kms || !browserProvider) {
        throw new Error('KMS or BrowserProvider not initialized');
      }
      const agent = await createVeramoAgent(kms, browserProvider);
      const resolvedDid = await agent.resolveDid({ didUrl: did });
      setResolvedDidDocument(resolvedDid);
    } catch (error) {
      console.error('Error resolving DID:', error);
      toast.error('Error resolving DID. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchJwt = async () => {
      try {
        const jwtRes = await axios.get('http://localhost:5000/university/getStoredJwt');
        if (jwtRes.data.success) {
          setJwt(jwtRes.data.jwt);
          setStatusMessage('Your application has been approved. Here is your JWT:');
        }
      } catch (error) {
        console.error('Error fetching JWT:', error);
      }
    };

    const interval = setInterval(fetchJwt, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleReturnToLogin = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem' }}>
      <Paper elevation={3} sx={{ padding: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          University Issue
        </Typography>
        <WalletConnection
          setKms={setKms}
          setBrowserProvider={setBrowserProvider}
          setKeys={setKeys}
          setSigner={setSigner}
          setSelectedKey={setSelectedKey}
        />
        {keys.length > 0 && (
          <AccountSelector
            keys={keys}
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
          />
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="DID"
            placeholder="Enter your DID e.g. did:example:123"
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
   
    <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
      The JWT is displayed below. You can copy it for your use.
    </Typography>
    <pre
      style={{
        wordBreak: 'break-word', // Allows breaking long words
        whiteSpace: 'pre-wrap', // Preserves whitespace and wraps text
        maxHeight: '200px', // Limits the height of the pre element
        overflowY: 'auto', // Adds a vertical scrollbar if content overflows
        backgroundColor: '#f5f5f5', // Light gray background for better readability
        padding: '10px', // Padding for better readability
        borderRadius: '5px', // Rounded corners
        fontFamily: 'monospace', // Monospaced font for technical data
      }}
    >
      {jwt}
    </pre>
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      onClick={handleReturnToLogin}
      sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
    >
      Return to Login
    </Button>
  </div>
)}
        {resolvedDidDocument && (
          <div>
            <Typography variant="h5" align="center" gutterBottom>
              Resolved DID Document:
            </Typography>
            <pre
              style={{
                wordBreak: 'break-word', // Allows breaking long words
                whiteSpace: 'pre-wrap', // Preserves whitespace and wraps text
                maxHeight: '200px', // Limits the height of the pre element
                overflowY: 'auto', // Adds a vertical scrollbar if content overflows
                backgroundColor: '#f5f5f5', // Light gray background for better readability
                padding: '10px', // Padding for better readability
                borderRadius: '5px', // Rounded corners
              }}
            >
              {JSON.stringify(resolvedDidDocument, null, 2)}
            </pre>
          </div>
        )}
       
      </Paper>
      <ToastContainer />
    </Container>
  );
};

export default UniversityIssue;