import { useState } from 'react';
import Dropdown from './Dropdown';
import { Option } from './Dropdown';
import { ConfiguredAgent, issueCredential } from './Utils';
import { ManagedKeyInfo, VerifiableCredential } from '@veramo/core';

interface CredentialIssuerProps {
  agent: ConfiguredAgent | null;
  selectedKey: ManagedKeyInfo | null;
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<string | null>>;
  setVerifiableCredential: React.Dispatch<React.SetStateAction<VerifiableCredential | null>>;
}

const CredentialIssuer: React.FC<CredentialIssuerProps> = ({
  agent,
  selectedKey,
  setSelectedAlgorithm,
  setVerifiableCredential,
}) => {
  const [inputSubject, setInputSubject] = useState('');
  const [signatureType, setSignatureType] = useState('');
  const [claims, setClaims] = useState<{ key: string; value: string }[]>([]);

  // Update subject input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSubject(event.target.value);
  };

  // Handle dropdown for signature type
  const handleDropdownSelect = (option: Option) => {
    setSignatureType(option.value);
    setSelectedAlgorithm(option.value);
  };

  // Add a new claim
  const handleAddClaim = () => {
    setClaims([...claims, { key: '', value: '' }]);
  };

  // Update a claim
  const handleClaimChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedClaims = [...claims];
    updatedClaims[index][field] = value;
    setClaims(updatedClaims);
  };

  // Issue credential with custom claims
  const handleIssueCredential = async () => {
    if (!agent || !selectedKey || !inputSubject || !signatureType) {
      console.error('Missing required fields');
      return;
    }

    // Convert claims array to an object for the credentialSubject
    const credentialSubject = claims.reduce((acc: { [key: string]: string }, claim) => {
      acc[claim.key] = claim.value;
      return acc;
    }, { id: inputSubject });

    const credential = await issueCredential(agent, selectedKey, credentialSubject, signatureType);
    setVerifiableCredential(credential);
     // Save the credential to local storage
     const account = selectedKey.meta?.account.address;
     const storedCredentials = JSON.parse(localStorage.getItem(`credentials_${account}`) || '[]');
     storedCredentials.push(credential);
     localStorage.setItem(`credentials_${account}`, JSON.stringify(storedCredentials));
  };

  const options = [
    { value: 'EthTypedDataSignature', label: 'EthTypedDataSignature' },
    { value: 'EthereumEip712Signature2021', label: 'EthereumEip712Signature2021' },
  ];

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Signature Type</label>
          <Dropdown options={options} onSelect={handleDropdownSelect} placeholder="Choose signature type" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Claims</label>
          {claims.map((claim, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={claim.key}
                onChange={(e) => handleClaimChange(index, 'key', e.target.value)}
                placeholder="Claim Key"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={claim.value}
                onChange={(e) => handleClaimChange(index, 'value', e.target.value)}
                placeholder="Claim Value"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          ))}
          <button onClick={handleAddClaim} className="mt-2 text-blue-500">+ Add Claim</button>
        </div>
        <button
          onClick={handleIssueCredential}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={!inputSubject || !signatureType}
        >
          Issue Credential
        </button>
      </div>
    </div>
  );
};

export default CredentialIssuer;
