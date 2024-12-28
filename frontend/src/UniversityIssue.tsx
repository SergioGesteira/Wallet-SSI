import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import WalletConnection from './components/WalletConnection';
import AccountSelector from './components/AccountSelector';

import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from 'ethers';
import { ConfiguredAgent } from './components/Utils';
import { createAgent, IKeyManager, ICredentialPlugin, IResolver, IDataStore, IDIDManager, VerifiableCredential, VerifiablePresentation, ManagedKeyInfo } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { Resolver } from 'did-resolver';
// import PresentationCreator from './components/PresentationCreator';

const UniversityIssue: React.FC = () => {
  const [did, setDid] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [response, setResponse] = useState<unknown>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [jwt, setJwt] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resolvedDidDocument, setResolvedDidDocument] = useState<any>(null);
  const [kms, setKms] = useState<Web3KeyManagementSystem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [browserProvider, setBrowserProvider] = useState<BrowserProvider | null>(null);
  const [verifiableCredential, setVerifiableCredential] = useState<VerifiableCredential | null>(null);
  // const [presentationJwt, setPresentationJwt] = useState<string>('');
  const [verifiablePresentation, setVerifiablePresentation] = useState<VerifiablePresentation | null>(null);
  const [keys, setKeys] = useState<ManagedKeyInfo[]>([]);
  const [credentialJson, setCredentialJson] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [selectedKey, setSelectedKey] = useState<ManagedKeyInfo | null>(null);
  const [selectedAlgorithm] = useState<string>('EthTypedDataSignature');
  const [agent, setAgent] = useState<ConfiguredAgent | null>(null);

  const navigate = useNavigate();

   const importDids = useCallback(async () => {
      if (!agent) {
        throw new Error('Agent not initialized');
      }
  
      if (!keys || keys.length === 0) {
        throw new Error('No keys found');
      }
  
      keys.forEach(async (key) => {
        const did = `did:ethr:sepolia:${key.meta?.account.address}`;
        const importedDid = await agent.didManagerImport({
          did,
          controllerKeyId: key.kid,
          provider: 'did:ethr:sepolia',
          keys: [
            {
              kid: key.kid,
              type: 'Secp256k1',
              kms: 'web3',
              publicKeyHex: key.publicKeyHex,
              meta: key.meta,
              privateKeyHex: '',
            },
          ],
        });
        console.log('DID created: ', importedDid);
        const test = await agent.resolveDid({ didUrl: did });
        console.log('DID resolved: ', test);
      });
    }, [agent, keys]);
    
  const createVeramoAgent = useCallback(async () => {
      const didStore = new MemoryDIDStore();
      const keyStore = new MemoryKeyStore();
      const browserProvider = new BrowserProvider(window.ethereum as Eip1193Provider);
  
      const registries = {
        mainnet: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
        sepolia: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
      };
      if (!kms || !browserProvider) {
        throw new Error('KMS not initialized');
      }
     
      const veramoAgent = createAgent<IDIDManager & IResolver & ICredentialPlugin & IDataStore & IKeyManager>({
        plugins: [
          new KeyManager({
            store: keyStore,
            kms: {
              web3: kms,
            },
          }),
          new DIDManager({
            store: didStore,
            defaultProvider: 'did:ethr',
            providers: {
              'did:ethr': new EthrDIDProvider({
                defaultKms: 'web3',
                registry: registries['mainnet'],
                web3Provider: browserProvider,
              }),
              'did:ethr:sepolia': new EthrDIDProvider({
                defaultKms: 'web3',
                registry: registries['sepolia'],
                web3Provider: browserProvider,
              }),
            },
          }),
          new DIDResolverPlugin({
            resolver: new Resolver(
              getEthrDidResolver({
                networks: [
                  {
                    name: 'mainnet',
                    registry: registries['mainnet'],
                    provider: browserProvider,
                    signer: browserProvider.getSigner(),
                  },
                  {
                    name: 'sepolia',
                    registry: registries['sepolia'],
                    provider: browserProvider,
                    signer: browserProvider.getSigner(),
                  },
                ],
              })
            ),
          }),
          new CredentialPlugin({
            issuers: [new CredentialProviderEIP712(), new CredentialProviderEip712JWT()],
          }),
        ],
      });
    
      console.log('Veramo Agent creado');
      setAgent(veramoAgent);
    }, [kms,setAgent]);
  

  useEffect(() => {
     if (kms && !agent) {
       createVeramoAgent();
     }
     if (agent) {
       importDids();
     }
   }, [kms, createVeramoAgent, agent, importDids]);
   
  

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
      if (!agent) {
        throw new Error('Agent not initialized');
      }
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
          setJwt(jwtRes.data);
          setStatusMessage('Your application has been approved. Here is your JWT:');
        }
      } catch (error) {
        console.error('Error fetching JWT:', error);
      }
    };

    const interval = setInterval(fetchJwt, 10000); // Check every  seconds
    return () => clearInterval(interval);
  }, []);

  const handleReturnToLogin = () => {
    navigate('/');
  };

  useEffect(() => {
  const fetchVerifiableCredential = async () => {
    try {
      const res = await axios.get('http://localhost:5000/university/getStoredVerifiableCredential');
      if (res.data.success) {
        const credential = JSON.parse(res.data.verifiableCredential);
        setVerifiableCredential(credential);
        setCredentialJson(JSON.stringify(credential, null, 2)); 
        toast.success('Verifiable Credential fetched successfully.');
      } else {
        toast.error('No Verifiable Credential found.');
      }
    } catch (error) {
      console.error('Error fetching verifiable credential:', error);
      
    }
  };
    const interval = setInterval(fetchVerifiableCredential, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  const handleCreatePresentation = async () => {
    if (!agent || !selectedKey || !verifiableCredential) {
      toast.error('Missing required fields to create presentation.');
      return;
    }
    try {
      const did = `did:ethr:sepolia:${selectedKey.meta?.account.address}`;
      console.log('Holder DID:', did);

      const presentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: did,
          verifiableCredential: [verifiableCredential],
        },
        proofFormat: selectedAlgorithm,
      });

      setVerifiablePresentation(presentation);
      toast.success('Verifiable Presentation created successfully.');
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast.error('Error creating presentation. Please try again later.');
    }
  };
  const handleSetVerifiableCredential = () => {
    try {
      const parsedCredential = JSON.parse(credentialJson) as VerifiableCredential;
      setVerifiableCredential(parsedCredential);
      toast.success('Verifiable Credential set successfully.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Invalid JWT format. Please enter a valid JWT.');
    }
  };

  

  const handleCopyJwtToClipboard = () => {
    if (verifiablePresentation && verifiablePresentation.proof && verifiablePresentation.proof.jwt) {
      navigator.clipboard.writeText(verifiablePresentation.proof.jwt)
        .then(() => {
          toast.success('JWT copied to clipboard.');
        })
        .catch((error) => {
          console.error('Error copying JWT to clipboard:', error);
          toast.error('Error copying JWT to clipboard.');
        });
    } else {
      toast.error('No JWT available to copy.');
    }
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
         {verifiableCredential && (
          <>
            <TextField
              label="Verifiable Credential"
              placeholder="Paste your verifiable credential here"
              multiline
              rows={6}
              variant="outlined"
              fullWidth
              value={credentialJson}
              onChange={(e) => setCredentialJson(e.target.value)}
              sx={{ marginTop: '1.5rem' }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSetVerifiableCredential}
              sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
            >
              Set Verifiable Credential
            </Button>
          </>
        )}
        {verifiableCredential && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCreatePresentation}
            sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
          >
            Create Verifiable Presentation
          </Button>
        )}
        {verifiablePresentation && (
          <div>
            <Typography variant="h5" align="center" gutterBottom>
              Verifiable Presentation:
            </Typography>
            <pre
              style={{
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '5px',
              }}
            >
              {JSON.stringify(verifiablePresentation, null, 2)}
            </pre>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCopyJwtToClipboard}
              sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
            >
              Copy JWT to Clipboard
            </Button>
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
       
      </Paper>
      <ToastContainer />
    </Container>
  );
};


export default UniversityIssue;