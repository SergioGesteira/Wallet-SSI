import React, { useState, useEffect, useCallback } from 'react';

import { Container, Typography, Paper, TextField, Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import WalletConnection from './components/WalletConnection';
import AccountSelector from './components/AccountSelector';
import CredentialSelector from './components/CredentialSelector';
// import DidDisplay from './components/DidDisplay';
// import CredentialIssuer from './components/CredentialIssuer';
// import CredentialDisplay from './components/CredentialDisplay';
// import CredentialValidator from './components/CredentialValidator';
// import PresentationCreator from './components/PresentationCreator';
// import PresentationDisplay from './components/PresentationDisplay';
// import PresentationValidator from './components/PresentationValidator';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { BrowserProvider, Signer } from 'ethers';
import { addDelegate, changeOwner, ConfiguredAgent, getDidDocument, revokeDelegate  } from './components/Utils';
import { createAgent, IKeyManager, ICredentialPlugin, IResolver, IDataStore, IDIDManager, VerifiableCredential, VerifiablePresentation, ManagedKeyInfo , DIDDocument, DIDResolutionResult} from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { Resolver } from 'did-resolver';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, sepolia } from '@reown/appkit/networks';
import DidDisplay from './components/DidDisplay';
import CredentialIssuer from './components/CredentialIssuer';
// import PresentationCreator from './components/PresentationCreator';

declare global {
    interface Window {
      Buffer: typeof Buffer;
    }
  }
  
  window.Buffer = Buffer;

   // 1. Get projectId
   const projectId: string = import.meta.env.VITE_WALLETCONNECT_ID;
  
   // 2. Set the networks
   const networks = [sepolia, mainnet];
   console.log('Networks: ', networks);
   
   const metadata = {
     name: 'test',
     description: 'My Website description',
     url: 'http://localhost:3001', // origin must match your domain & subdomain
     icons: ['https://avatars.mywebsite.com/'],
   };
   
   // 4. Create a AppKit instance
   createAppKit({
     adapters: [new EthersAdapter()],
     networks,
     metadata,
     projectId,
     features: {
       analytics: false, // Optional - defaults to your Cloud configuration
       swaps: false, // Optional - defaults to your Cloud configuration
       onramp: false, // Optional - defaults to your Cloud configuration
       history: false, // Optional - defaults to your Cloud configuration
     },
   });


const UniversityIssue: React.FC = () => {
//   const [did, setDid] = useState<string>('');
//   const [response, setResponse] = useState<unknown>(null);
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jwt, setJwt] = useState<string | null>(null);
  const [kms, setKms] = useState<Web3KeyManagementSystem | null>(null);

  const [browserProvider, setBrowserProvider] = useState<BrowserProvider | null>(null);
  const [verifiableCredential, setVerifiableCredential] = useState<VerifiableCredential | null>(null);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  // const [presentationJwt, setPresentationJwt] = useState<string>('');
  const [verifiablePresentation, setVerifiablePresentation] = useState<VerifiablePresentation | null>(null);
  const [keys, setKeys] = useState<ManagedKeyInfo[]>([]);
  const [credentialJson, setCredentialJson] = useState<string>('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signer, setSigner] = useState<Signer | null>(null);
  const [selectedKey, setSelectedKey] = useState<ManagedKeyInfo | null>(null);
  const [agent, setAgent] = useState<ConfiguredAgent | null>(null);
  const [revokeDelegateAddress, setRevokeDelegateAddress] = useState<string>('');
  const [selectedDidDocument, setSelectedDidDocument] = useState<DIDDocument | null>(null);
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [expirationTime, setExpirationTime] =  useState(3600);
  
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
    }, [kms,setAgent, browserProvider]);
  

  useEffect(() => {
     if (kms && !agent) {
       createVeramoAgent();
     }
     if (agent) {
       importDids();
     }
   }, [kms, createVeramoAgent, agent, importDids]);


   useEffect(() => {
    const resolve = async () => {
      if (selectedKey && agent) {
        const data: DIDResolutionResult = await getDidDocument(agent, selectedKey);
        console.log('DID Document: ', data.didDocument);
        setSelectedDidDocument(data.didDocument);
      }
    };
    resolve();
  }, [selectedKey, agent]);

  
  const handleCreatePresentation = async () => {
    if (!agent || !selectedKey || !verifiableCredential) {
      toast.error('Missing required fields to create presentation.');
      return;
    }
    try {
      // Nonce input from user
      
      const nonce = Math.floor(Math.random() * 1000000);
      const did = `did:ethr:sepolia:${selectedKey.meta?.account.address}`;
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    
      const presentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: did,
          verifiableCredential: [verifiableCredential],
          nbf: timestamp,
          nonce: nonce,
        },
        proofFormat: selectedAlgorithm || '',
      });

      setVerifiablePresentation(presentation);
      toast.success('Verifiable Presentation created successfully.');
      
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast.error('Error creating presentation. Please try again later.');
    }
  };

  const handleSetVerifiableCredential = async () => {
    try {
      const parsedCredential = JSON.parse(credentialJson) as VerifiableCredential;
      if (!agent) {
        throw new Error('Agent not initialized');
      }
  
      // Validate the credential
      const isValid = await agent.verifyCredential({ credential: parsedCredential });
      if (!isValid.verified) {
        throw new Error('Credential validation failed');
      }
  
      setVerifiableCredential(parsedCredential);
      toast.success('Verifiable Credential set successfully.');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Invalid JWT format or validation failed. Please enter a valid JWT.');
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


  const handleChangeOwner = useCallback(async () => {
    if (!browserProvider) {
      throw new Error('Browser provider not initialized');
    }

    const newOwner = prompt('Please enter the new owner address:');
    if (!newOwner) {
      alert('New owner address is required');
      return;
    }
    const signer = await browserProvider.getSigner();
    const identity = `did:ethr:sepolia:${selectedKey?.meta?.account.address}`; // Assuming you want to change the owner of the selected key's DID
    
    changeOwner(browserProvider, agent, signer, identity, newOwner);
  }, [browserProvider, agent, selectedKey]);

  const handleAddDelegate = useCallback(async () => {
    if (!browserProvider) {
      throw new Error('Browser provider not initialized');
    }
  
    const signer = await browserProvider.getSigner();
    const identity = `did:ethr:sepolia:${selectedKey?.meta?.account.address}`; // Assuming you want to add a delegate to the selected key's DID
  
    await addDelegate(browserProvider, agent, signer, identity, delegateAddress, expirationTime);
  }, [browserProvider, agent, selectedKey,delegateAddress,expirationTime]);

  const handleRevokeDelegate = useCallback(async () => {
    if (!browserProvider) {
      throw new Error('Browser provider not initialized');
    }

    if (!revokeDelegateAddress) {
      alert('Delegate address is required');
      return;
    }

    const signer = await browserProvider.getSigner();
    const identity = `did:ethr:sepolia:${selectedKey?.meta?.account.address}`; // Assuming you want to revoke a delegate from the selected key's DID

    await revokeDelegate(browserProvider, agent, signer, identity, revokeDelegateAddress);
    }, [browserProvider, agent, selectedKey, revokeDelegateAddress]);
  


    return (
      <Container maxWidth="sm" sx={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <Paper elevation={3} sx={{ padding: '2rem', borderRadius: '8px' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome to your SSI-Wallet
          </Typography>
          <WalletConnection 
            setKms={setKms} 
            setKeys={setKeys} 
            setBrowserProvider={setBrowserProvider} 
            setSigner={setSigner} 
          />
          
          {keys.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <AccountSelector keys={keys} selectedKey={selectedKey} setSelectedKey={setSelectedKey} setCredentials={setCredentials}/>
            </div>
          )}
            
        
          {selectedDidDocument && (
            <>
              <div style={{ marginTop: '2rem' }}>
                <DidDisplay selectedDidDocument={selectedDidDocument} />
              </div>
              {credentials.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <CredentialSelector credentials={credentials} setSelectedCredential={setVerifiableCredential} />
              </div>
            )}
              <div style={{ marginTop: '2rem' }}>
                <CredentialIssuer
                  agent={agent}
                  selectedKey={selectedKey}
                  setSelectedAlgorithm={setSelectedAlgorithm}
                  setVerifiableCredential={setVerifiableCredential}
                />
              </div>
            </>
          )}

          <Typography variant="h4" align="center" gutterBottom>
            Import Verifiable Credential
          </Typography>
          <TextField
            label="Verifiable Credential JWT"
            placeholder="Paste your verifiable credential JWT here"
            multiline
            rows={6}
            variant="outlined"
            fullWidth
            value={credentialJson}
            onChange={(e) => setCredentialJson(e.target.value)}
            sx={{ marginTop: '2rem' }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSetVerifiableCredential}
            sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
          >
            Import Credential
          </Button>
    
          {jwt && (
            <div style={{ marginTop: '2rem' }}>
              <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
                The JWT is displayed below. You can copy it for your use.
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
                  fontFamily: 'monospace',
                  marginTop: '1rem'
                }}
              >
                {jwt}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCredentialJson(e.target.value)}
                sx={{ marginTop: '2rem' }}
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
            <div style={{ marginTop: '2rem' }}>
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
            </div>
          )}
    
        </Paper>
    
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={handleChangeOwner} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-full"
          >
            Change Owner
          </button>
        </div>
    
        <div style={{ marginTop: '2rem' }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delegate Address:
            <input
              type="text"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              className="block w-full text-sm font-medium text-gray-700 mb-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2"
            />
          </label>
        </div>
    
        <div style={{ marginTop: '2rem' }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Time (seconds):
            <input
              type="text"
              value={expirationTime}
              onChange={(e) => setExpirationTime(Number(e.target.value))}
              className="block w-full text-sm font-medium text-gray-700 mb-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2"
            />
          </label>
        </div>
    
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={handleAddDelegate} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-full"
          >
            Add Delegate
          </button>
        </div>
    
        <div style={{ marginTop: '2rem' }}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revoke Delegate Address:
            <input
              type="text"
              value={revokeDelegateAddress}
              onChange={(e) => setRevokeDelegateAddress(e.target.value)}
              className="block w-full text-sm font-medium text-gray-700 mb-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2"
            />
          </label>
        </div>
    
        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={handleRevokeDelegate} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out w-full"
          >
            Revoke Delegate
          </button>
        </div>
    
        <ToastContainer />
      </Container>
    );
  };    
export default UniversityIssue;