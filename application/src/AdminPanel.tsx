import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Paper, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserProvider } from 'ethers';
import { ConfiguredAgent } from './components/Utils'; 

import { ManagedKeyInfo , DIDResolutionResult, DIDDocument, VerifiableCredential} from '@veramo/core';
//import { createVeramoAgent } from './components/VeramoAgent'; 
import { Web3KeyManagementSystem } from '@veramo/kms-web3';

import { KeyManager } from '@veramo/key-manager';
import { createAgent, IKeyManager, ICredentialPlugin, IResolver, IDataStore, IDIDManager } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { MemoryKeyStore } from '@veramo/key-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import DidDisplay from './components/DidDisplay';
import CredentialIssuer from './components/CredentialIssuer';
import CredentialDisplay from './components/CredentialDisplay';
import CredentialValidator from './components/CredentialValidator';
import PresentationCreator from './components/PresentationCreator';
import PresentationDisplay from './components/PresentationDisplay';
import PresentationValidator from './components/PresentationValidator';
import { getDidDocument } from './components/Utils';

declare global {
  interface Window {
    ethereum: any;
  }
}

const AdminPanel: React.FC = () => {
  const [pendingDIDs, setPendingDIDs] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [agent, setAgent] = useState<ConfiguredAgent| null>(null);
  const [selectedKey, setSelectedKey] = useState<ManagedKeyInfo | null>(null);
  const [verifiableCredential, setVerifiableCredential] = useState<VerifiableCredential | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [selectedDidDocument, setSelectedDidDocument] = useState<DIDDocument | null>(null);
  const [verifiablePresentation, setVerifiablePresentation] = useState<any>(null);
  const [keys, setKeys] = useState<ManagedKeyInfo[]>([]);
  const [kms, setKms] = useState<Web3KeyManagementSystem | null>(null);

  //const fixedAlgorithm = "EthTypedDataSignature";

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
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);  // Solicita las cuentas al usuario
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const kms = new Web3KeyManagementSystem({ provider });
      setKms(kms);

  
      const listedKeys = await kms.listKeys();
      if (listedKeys.length === 0) {
        throw new Error('No keys found');
      }
      setKeys(listedKeys);
      setSelectedKey(listedKeys[0]);
     
      console.log('Dirección de la cuenta:', address);
      
   
    } catch (error) {
      console.error('Error al conectar con Metamask:', error);
      toast.error('Error al conectar con Metamask. Por favor, intenta nuevamente.');
      return null;
    }
  };


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
    const browserProvider = new BrowserProvider(window.ethereum);

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

  


  // User approves DID
  const handleApprove = async (did: string) => {
   
    try {
   
      await importDids(); 

      const selectedKey = keys[0]; 
      if (!selectedKey) {
        throw new Error('No managed key found for the selected agent.');
      }

        // Approve DID
      const res = await axios.post('http://localhost:5000/university/approveDid', { did });
      setMessage(res.data.message);
      setPendingDIDs(pendingDIDs.filter((d) => d !== did));
      toast.success(`DID ${did} approved successfully.`);

      // if (!agent) {
      //   toast.error('Agent is not initialized.');
      //   return;
      // }
      
      // // Issue credential
      // const credential = await issueCredential(
      //   agent,
      //   selectedKey,
      //   { id: did }, // Subject of the credential
      //   fixedAlgorithm
      // );

      // setVerifiableCredential(credential);
      // toast.success(`Credential issued for DID ${did}.`);
    } catch (error) {
      console.error('Error approving DID or issuing credential:', error);
      toast.error('Error approving DID or issuing credential. Please try again later.');
    }
  };

  // const handleCreatePresentation = async () => {
  //   if (!issuedCredential) {
  //     toast.error('No credential available to create presentation.');
  //     return;
  //   }

  //   try {

  //     if (!agent) {
  //       toast.error('Agent is not initialized.');
  //       return;
  //     }
      
  //     const presentation = await agent.createVerifiablePresentation({
  //       presentation: {
  //         context: "https://www.w3.org/2018/credentials/v1",
  //         type: ["VerifiablePresentation"],
  //         holder: issuedCredential.issuer,
  //         verifiableCredential: [issuedCredential]
  //       },
  //       proofFormat: 'EthTypedDataSignature',
  //     });

  //     setVerifiablePresentation(presentation);
  //     toast.success('Presentation created successfully.');
  //   } catch (error) {
  //     console.error('Error creating presentation:', error);
  //     toast.error('Error creating presentation. Please try again later.');
  //   }
  // };

  // const handleValidatePresentation = async () => {
  //   if (!verifiablePresentation) {
  //     toast.error('No presentation available to validate.');
  //     return;
  //   }

  //   try {
  //     if (!agent) {
  //       toast.error('Agent is not initialized.');
  //       return;
  //     }
      
  //     const validation = await agent.verifyPresentation({
  //       presentation: verifiablePresentation,
  //       proofFormat: 'EthTypedDataSignature',
  //     });

  //     if (validation.verified) {
  //       toast.success('Presentation validated successfully.');
  //     } else {
  //       toast.error('Presentation validation failed.');
  //     }
  //   } catch (error) {
  //     console.error('Error validating presentation:', error);
  //     toast.error('Error validating presentation. Please try again later.');
  //   }
  // };

  // Reject a DID request
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
      <Button variant="contained" color="primary" onClick={connectToMetamask}>
        Connect to MetaMask
      </Button>
      <div style={{ marginBottom: '20px' }}></div>
      {selectedDidDocument != null && <DidDisplay selectedDidDocument={selectedDidDocument} />}
      {selectedDidDocument != null && (
        <CredentialIssuer
          agent={agent}
          selectedKey={selectedKey}
          setSelectedAlgorithm={setSelectedAlgorithm}
          setVerifiableCredential={setVerifiableCredential} did={''}        />
      )}
      {verifiableCredential != null && <CredentialDisplay verifiableCredential={verifiableCredential} />}
      {verifiableCredential != null && (
        <CredentialValidator agent={agent} verifiableCredential={verifiableCredential} />
      )}
      {verifiableCredential != null && (
        <PresentationCreator
          agent={agent}
          selectedAlgorithm={selectedAlgorithm}
          selectedKey={selectedKey}
          verifiableCredential={verifiableCredential}
          setVerifiablePresentation={setVerifiablePresentation}
        />
      )}
      {verifiablePresentation != null && <PresentationDisplay verifiablePresentation={verifiablePresentation} />}
      {verifiablePresentation != null && (
        <PresentationValidator agent={agent} verifiablePresentation={verifiablePresentation} />
      )}
      <div style={{ marginBottom: '20px' }}></div>
      <List>
        {pendingDIDs.map((did) => (
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
              <Button variant="contained" color="secondary" onClick={() => handleReject(did)}>
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