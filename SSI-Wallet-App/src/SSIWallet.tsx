import React, { useState, useEffect, useCallback } from 'react';

import { Container, Typography, Paper, TextField, Button, Modal, Box } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import WalletConnection from './components/WalletConnection';
import AccountSelector from './components/AccountSelector';
import CredentialSelector from './components/CredentialSelector';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { BrowserProvider, Signer } from 'ethers';
import { addDelegate, changeOwner, ConfiguredAgent, getDidDocument, revokeDelegate } from './components/Utils';
import { createAgent, IKeyManager, ICredentialPlugin, IResolver, IDataStore, IDIDManager, VerifiableCredential, VerifiablePresentation, ManagedKeyInfo, DIDDocument, DIDResolutionResult } from '@veramo/core';
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
import CredentialDisplay from './components/CredentialDisplay';

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


const SSIWallet: React.FC = () => {
  //   const [did, setDid] = useState<string>('');
  //   const [response, setResponse] = useState<unknown>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jwt, setJwt] = useState<string | null>(null);
  const [kms, setKms] = useState<Web3KeyManagementSystem | null>(null);

  const [browserProvider, setBrowserProvider] = useState<BrowserProvider | null>(null);
  const [verifiableCredential, setVerifiableCredential] = useState<VerifiableCredential | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  // const [presentationJwt, setPresentationJwt] = useState<string>('');
  const [verifiablePresentation, setVerifiablePresentation] = useState<VerifiablePresentation | null>(null);
  const [keys, setKeys] = useState<ManagedKeyInfo[]>([]);
  const [credentialJson, setCredentialJson] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [typedAlgorithm] = useState<string>('EthTypedDataSignature');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signer, setSigner] = useState<Signer | null>(null);
  const [selectedKey, setSelectedKey] = useState<ManagedKeyInfo | null>(null);
  const [agent, setAgent] = useState<ConfiguredAgent | null>(null);
  const [revokeDelegateAddress, setRevokeDelegateAddress] = useState<string>('');
  const [selectedDidDocument, setSelectedDidDocument] = useState<DIDDocument | null>(null);
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [expirationTime, setExpirationTime] = useState(3600);
  const [showManageDID, setShowManageDID] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nonce, setNonce] = useState<string>('');

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
  }, [kms, setAgent, browserProvider]);


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


      const did = `did:ethr:sepolia:${selectedKey.meta?.account.address}`;
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

      const presentation = await agent.createVerifiablePresentation({
        presentation: {
          holder: did,
          verifiableCredential: [verifiableCredential],
          nbf: timestamp,
          nonce: nonce,
        },
        proofFormat: typedAlgorithm,
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

      const account = selectedKey?.meta?.account.address;
      const storedCredentials = JSON.parse(localStorage.getItem(`credentials_${account}`) || '[]');
      storedCredentials.push(parsedCredential);
      localStorage.setItem(`credentials_${account}`, JSON.stringify(storedCredentials));
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

    if (!delegateAddress) {
      alert('Delegate address is required');
      return;
    }
    const signer = await browserProvider.getSigner();
    const identity = `did:ethr:sepolia:${selectedKey?.meta?.account.address}`; // Assuming you want to add a delegate to the selected key's DID

    await addDelegate(browserProvider, agent, signer, identity, delegateAddress, expirationTime);
  }, [browserProvider, agent, selectedKey, delegateAddress, expirationTime]);

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


  const toggleManageDID = () => {
    setShowManageDID(!showManageDID);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem', marginBottom: '4rem', textAlign: 'left' }}>
      <Paper elevation={3} sx={{ padding: '2rem', borderRadius: '8px', textAlign: 'left' }}>
        <Typography variant="h4" align="left" gutterBottom>
          Welcome to your SSI-Wallet
        </Typography>
        <WalletConnection
          setKms={setKms}
          setKeys={setKeys}
          setBrowserProvider={setBrowserProvider}
          setSigner={setSigner}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={toggleManageDID}
          disabled={!selectedDidDocument}
          sx={{ marginTop: '2rem', width: '100%' }}
        >
          Manage DID
        </Button>
        {showManageDID && (
          <div style={{ position: 'absolute', top: '10rem', right: '2rem', width: '30%', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <Typography variant="h6" align="left" gutterBottom>
              DID Management
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleChangeOwner}
              sx={{ marginBottom: '1rem' }}
            >
              Change Owner
            </Button>

            <TextField
              label="Delegate Address"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
              fullWidth
              sx={{ marginBottom: '1rem' }}
            />
            <TextField
              label="Expiration Time (seconds)"
              value={expirationTime}
              onChange={(e) => setExpirationTime(Number(e.target.value))}
              fullWidth
              sx={{ marginBottom: '1rem' }}
            />

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleAddDelegate}
              sx={{ marginBottom: '1rem' }}
            >
              Add Delegate
            </Button>

            <TextField
              label="Revoke Delegate Address"
              value={revokeDelegateAddress}
              onChange={(e) => setRevokeDelegateAddress(e.target.value)}
              fullWidth
              sx={{ marginBottom: '1rem' }}
            />
            <div style={{ marginTop: '2rem' }}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleRevokeDelegate}
              >
                Revoke Delegate
              </Button>
            </div>
          </div>
        )}
        {keys.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <AccountSelector keys={keys} selectedKey={selectedKey} setSelectedKey={setSelectedKey} setCredentials={setCredentials} />
          </div>
        )}
        {selectedDidDocument && (
          <>
            <div style={{ marginTop: '2rem' }}>
              <DidDisplay selectedDidDocument={selectedDidDocument} />
            </div>
            {credentials.length > 0 && (
              <div className="mt-8">
                <div style={{ marginTop: '2rem' }}></div>
                <Typography variant="body2" align="left" color="textSecondary" gutterBottom>
                  In this section you can consult your avaliable verifiable credentials.
                </Typography>
                <div className="bg-white border border-gray-300 rounded-lg p-4 max-w-full overflow-x-auto">
                  <CredentialSelector
                    credentials={credentials}
                    setSelectedCredential={setSelectedCredential}
                    setVerifiableCredential={setVerifiableCredential}
                  />
                </div>
              </div>
            )}
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleOpenModal}
              sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
            >
              See My Credential
            </Button>
          </>
        )}
        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
            <Typography variant="h6" align="left" component="h2">
              My Credential
            </Typography>
            {selectedCredential ? (
              <CredentialDisplay verifiableCredential={selectedCredential} />
            ) : (
              <Typography variant="body2" align="left" color="textSecondary">
                No credential selected.
              </Typography>
            )}
          </Box>
        </Modal>
        <div style={{ marginTop: '2rem' }}>
          <Typography variant="body2" align="left" color="textSecondary" gutterBottom>
            You can issue a verifiable credential signed by yourself, it may not be accepted by all organizations!
          </Typography>
          <CredentialIssuer
            agent={agent}
            selectedKey={selectedKey}
            setSelectedAlgorithm={setSelectedAlgorithm}
            setVerifiableCredential={setVerifiableCredential}
          />
        </div>
        {jwt && (
          <div style={{ marginTop: '2rem' }}>
            <Typography variant="body2" align="left" color="textSecondary" gutterBottom>
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
        {(
          <>
          <div style={{ marginTop: '2rem' }}></div>
            <Typography variant="body2" align="left" color="textSecondary" gutterBottom>
              You can import verifiable credentials issued by organizations or institutions pasting it in JSON-LD format.
            </Typography>
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
              Import Verifiable Credential
            </Button>
          </>
        )}
        {(
          <>
          <div style={{ marginTop: '2rem' }}></div>
            <Typography variant="body2" align="left" color="textSecondary" gutterBottom>
              If you want to create a verifiable presentation, you can do so by clicking the button below.
              You can add a Nonce if an organization requires it.
            </Typography>
            <TextField
              label="Nonce (optional)"
              placeholder="Enter a nonce (optional)"
              variant="outlined"
              fullWidth
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              sx={{ marginTop: '1.5rem' }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCreatePresentation}
              sx={{ marginTop: '1.5rem', paddingY: '0.75rem', fontSize: '1rem' }}
            >
              Create Verifiable Presentation
            </Button>
          </>
        )}
        {verifiablePresentation && (
          <div style={{ marginTop: '2rem' }}>
            <Typography variant="h5" align="left" gutterBottom>
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
      <ToastContainer />
    </Container>
  );
};
export default SSIWallet;