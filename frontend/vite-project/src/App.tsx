import { useCallback, useEffect, useState } from 'react';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import {
  ManagedKeyInfo,
  VerifiableCredential,
  VerifiablePresentation,
  DIDResolutionResult,
  DIDDocument,
} from '@veramo/core';

import { Buffer } from 'buffer';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, sepolia } from '@reown/appkit/networks';
import WalletConnection from './components/WalletConnection';
import AccountSelector from './components/AccountSelector';
import DidDisplay from './components/DidDisplay';
import CredentialIssuer from './components/CredentialIssuer';
import CredentialDisplay from './components/CredentialDisplay';
import CredentialValidator from './components/CredentialValidator';
import PresentationCreator from './components/PresentationCreator';
import PresentationDisplay from './components/PresentationDisplay';
import PresentationValidator from './components/PresentationValidator';

//import Login from './components/login';
import { addDelegate, changeOwner, ConfiguredAgent, getDidDocument, revokeDelegate } from './utils';
import { BrowserProvider, Signer } from 'ethers';
import { veramoAgent } from './agent'; // Import the agent

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

window.Buffer = Buffer;

// 1. Get projectId
//const projectId: string = import.meta.env.VITE_WALLETCONNECT_ID;
const projectId: string = "a5e2df042276815c407d0d9b04889f73";


// 2. Set the networks
const networks = [sepolia, mainnet];
console.log('Networks: ', networks);

const metadata = {
  name: 'test',
  description: 'My Website description',
  url: 'http://localhost:5173', // origin must match your domain & subdomain
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

function App() {
  const [kms, setKms] = useState<Web3KeyManagementSystem | null>(null);
  const [keys, setKeys] = useState<ManagedKeyInfo[]>([]);
  const [selectedKey, setSelectedKey] = useState<ManagedKeyInfo | null>(null);
  const [agent,setAgent] = useState<ConfiguredAgent | null>(null);
  const [selectedDidDocument, setSelectedDidDocument] = useState<DIDDocument | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [verifiableCredential, setVerifiableCredential] = useState<VerifiableCredential | null>(null);
  const [verifiablePresentation, setVerifiablePresentation] = useState<VerifiablePresentation | null>(null);
  const [browserProvider, setBrowserProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [expirationTime, setExpirationTime] = useState(3600);
  const [revokeDelegateAddress, setRevokeDelegateAddress] = useState<string>('');
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // const [userClaims, setUserClaims] = useState<string>('');

  

  useEffect(() => {
    setAgent(veramoAgent);
  }, []);

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
  }, [browserProvider, agent,  selectedKey]);

  const handleAddDelegate = useCallback(async () => {
    if (!browserProvider) {
      throw new Error('Browser provider not initialized');
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

    // const handleLoginSuccess = (claims: string) => {
    //   setUserClaims(claims);
    //   setIsLoggedIn(true);
    // };

  return (
    <div className="App">
    
    <>
     
      {/* <Login agent={agent} onLoginSuccess={handleLoginSuccess} /> */}
    
      <WalletConnection setKms={setKms} setKeys={setKeys} setBrowserProvider={setBrowserProvider} setSigner = {setSigner} />
      <div style={{ marginBottom: '20px' }}></div>
      {keys.length > 0 && <AccountSelector keys={keys} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />}
      {selectedDidDocument != null && <DidDisplay selectedDidDocument={selectedDidDocument} />}
      {selectedDidDocument != null && (
        <CredentialIssuer
          agent={agent}
          selectedKey={selectedKey}
          setSelectedAlgorithm={setSelectedAlgorithm}
          setVerifiableCredential={setVerifiableCredential}
        />
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
      <button onClick={handleChangeOwner}className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
        Change Owner
      </button>
      
      <div style={{ marginBottom: '20px' }}></div>
      <div>
        <label>
          Delegate Address:
          <input
            type="text"
            value={delegateAddress}
            onChange={(e) => setDelegateAddress(e.target.value)}
            className="block text-sm font-medium text-gray-700 mb-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
      </div>
      <div>
        <label>
          Expiration Time (seconds):
          <input
            type="text"
            value={expirationTime}
            onChange={(e) => setExpirationTime(Number(e.target.value))}
            className="block text-sm font-medium text-gray-700 mb-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
      </div>
      <button onClick={handleAddDelegate} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
        Add Delegate
      </button>
      <div style={{ marginBottom: '20px' }}></div>
      <div style={{ marginBottom: '20px' }}></div>
      <div>
        <label>
          Revoke Delegate Address:
          <input
            type="text"
            value={revokeDelegateAddress}
            onChange={(e) => setRevokeDelegateAddress(e.target.value)}
            className="block text-sm font-medium text-gray-700 mb-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
      </div>
      <button onClick={handleRevokeDelegate} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
        Revoke Delegate
      </button>
      <div style={{ marginBottom: '20px' }}></div>    
      </>
    
    </div>
  )

}

export default App;
