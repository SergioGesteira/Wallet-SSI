import { useState, useEffect } from 'react';
import { ConfiguredAgent, issueCredential } from './Utils';
import { ManagedKeyInfo, VerifiableCredential } from '@veramo/core';

interface CredentialIssuerProps {
  agent: ConfiguredAgent | null;
  selectedKey: ManagedKeyInfo | null;
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<string | null>>;
  setVerifiableCredential: React.Dispatch<React.SetStateAction<VerifiableCredential | null>>;
  did: string;
}
const CredentialIssuer: React.FC<CredentialIssuerProps> = ({
    agent,
    selectedKey,
    setSelectedAlgorithm,
    setVerifiableCredential,
    did,
  }) => {
    const [inputSubject, setInputSubject] = useState(did); //  Update the inputSubject when the DID changes
    const [signatureType, setSignatureType] = useState('EthTypedDataSignature');
    useEffect(() => {
      setInputSubject(did); 
    }, [did]);
  
    // Simplificación, solo agregamos un claim fijo
   
  
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputSubject(event.target.value);
    };
   
    const handleIssueCredential = async () => {
  

      if (!agent || !selectedKey || !inputSubject|| !signatureType) {
        setSignatureType('EthTypedDataSignature');
        console.error('Missing required fields');
        return;
      }

      let claimValue = '';
      const universityDid = selectedKey.kid;
      console.log('universityDid:', universityDid);

      if (universityDid === 'provider-0x6E3Eee05f2B947008DdF6f2f7765D10Cb8Ea5F83') {
        claimValue = 'EETAC';
      } else if (universityDid=== 'provider-0xfA82488EFfc00b09291f6e3A894887C55892Fd69') {
        claimValue = 'ETSETB';
      } else {
        console.error('DID not recognized');
        return;
      }

    const claims = [{ key: 'college', value: claimValue }];
    
      // Crear el sujeto de la credencial con un claim fijo
      const credentialSubject = { id: inputSubject, ...Object.fromEntries(claims.map(c => [c.key, c.value])) };
  
      try {
        const credential = await issueCredential(agent, selectedKey, credentialSubject, signatureType);
        setVerifiableCredential(credential);
        setSelectedAlgorithm(signatureType);
        console.log('Credential issued:', credential);
      } catch (error) {
        console.error('Error issuing credential:', error);
      }
      
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Issue Credential</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={inputSubject}
              onChange={handleInputChange}
              placeholder="Enter subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
          </div>
          <button
            onClick={handleIssueCredential}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={!inputSubject}
          >
            Issue Credential
          </button>
        </div>
      </div>
    );
  };
  export default CredentialIssuer;