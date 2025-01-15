import { VerifiableCredential } from '@veramo/core';

interface CredentialSelectorProps {
  credentials: VerifiableCredential[];
  setSelectedCredential: React.Dispatch<React.SetStateAction<VerifiableCredential | null>>;
}

const CredentialSelector: React.FC<CredentialSelectorProps> = ({ credentials, setSelectedCredential }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Select a Credential</h2>
      <div className="space-y-3">
        {credentials.map((credential, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`credential_${index}`}
              name="credential"
              value={index}
              onChange={() => setSelectedCredential(credential)}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <label htmlFor={`credential_${index}`} className="ml-2 text-gray-700 hover:text-gray-900 cursor-pointer">
              {credential.credentialSubject.id}
            </label>
          </div>
        ))}
      </div>
      {credentials.length === 0 && (
        <p className="text-gray-500 italic">No credentials available for this account.</p>
      )}
    </div>
  );
};

export default CredentialSelector;