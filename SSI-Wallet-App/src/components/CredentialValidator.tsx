import { useState } from 'react';
import { ConfiguredAgent, validateCredential } from './Utils';
import { VerifiableCredential } from '@veramo/core';

interface CredentialValidatorProps {
  agent: ConfiguredAgent | null;
  verifiableCredential: VerifiableCredential | null;
}

const CredentialValidator: React.FC<CredentialValidatorProps> = ({ agent, verifiableCredential }) => {
  const [credentialValidated, setCredentialValidated] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidateCredential = async () => {
    if (!agent) {
      console.error('No agent selected');
      return;
    }

    if (!verifiableCredential) {
      console.error('No credential selected');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      console.log('Validating credential:', verifiableCredential);
      const result = await validateCredential(agent, verifiableCredential);
      console.log('Validation result:', result);
      setCredentialValidated(result ? 'Credential is valid' : 'Credential is not valid');
    } catch (error) {
      console.error('Validation error:', error);
      setError('Error occurred during validation');
      setCredentialValidated('Error occurred during validation');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Credential Validation</h2>
      <button
        onClick={handleValidateCredential}
        disabled={isValidating || !verifiableCredential}
        className={`w-full ${
          isValidating || !verifiableCredential ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mb-4`}
      >
        {isValidating ? 'Validating...' : 'Validate Credential'}
      </button>
      {credentialValidated && (
        <div
          className={`mt-4 p-4 rounded-md ${
            credentialValidated.includes('valid') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <p className="font-semibold">{credentialValidated}</p>
          </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default CredentialValidator;
