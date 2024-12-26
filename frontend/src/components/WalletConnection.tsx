import { useEffect, useState, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { ManagedKeyInfo } from '@veramo/core';

interface WalletConnectionProps {
  setKms: React.Dispatch<React.SetStateAction<Web3KeyManagementSystem | null>>;
  setKeys: React.Dispatch<React.SetStateAction<ManagedKeyInfo[]>>;
  setBrowserProvider: React.Dispatch<React.SetStateAction<BrowserProvider | null>>;
  setSigner: React.Dispatch<React.SetStateAction<JsonRpcSigner | null>>;
  setSelectedKey: React.Dispatch<React.SetStateAction<ManagedKeyInfo | null>>;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ setKms, setKeys, setBrowserProvider, setSigner, setSelectedKey}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      console.error('MetaMask is not installed. Please install MetaMask.');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);  // Request accounts from the user
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const web3Kms = new Web3KeyManagementSystem({ provider });
      setKms(web3Kms);
      setBrowserProvider(provider);
      setSigner(signer);

      const listedKeys = await web3Kms.listKeys();
      setKeys(listedKeys);
      if (listedKeys.length > 0) {
        setSelectedKey(listedKeys[0]); // Set the first key as the selected key
      }

      setIsConnected(true);
      console.log('Connected wallet address:', address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [setKms, setKeys, setBrowserProvider, setSigner, setSelectedKey]);

  useEffect(() => {
    if (!isConnected) {
      connectWallet();
    }
  }, [isConnected, connectWallet]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Connect to your Wallet</h2>
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
        >
          Connect 
        </button>
      </div>
    </div>
  );
};

export default WalletConnection;