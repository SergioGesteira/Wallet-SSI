import { 
  DIDResolutionResult,
  ICredentialPlugin,
  IDataStore,
  IDIDManager,
  IKeyManager,
  IResolver,
  ManagedKeyInfo,
  TAgent,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core';



type ConfiguredAgent = TAgent<IDIDManager & IResolver & ICredentialPlugin & IDataStore & IKeyManager>;

async function getDidDocument(agent: ConfiguredAgent, selectedKey: ManagedKeyInfo): Promise<DIDResolutionResult> {
  if (!agent) {
    throw new Error('Agent not initialized');
  }

  if (!selectedKey) {
    throw new Error('No key selected');
  }

  const did = `did:ethr:sepolia:${selectedKey.meta?.account.address}`;

  const didDocument = await agent.resolveDid({ didUrl: did });

  return didDocument;
}

async function issueCredential(
  agent: ConfiguredAgent,
  selectedKey: ManagedKeyInfo,
  credentialSubject: object,
  selectedAlgorithm: string
): Promise<VerifiableCredential> {
  if (!agent) {
    throw new Error('Agent not initialized');
  }

  if (!selectedKey) {
    throw new Error('No key selected');
  }

  if (!credentialSubject) {
    throw new Error('No input subject');
  }

  if (selectedAlgorithm === '') {
    throw new Error('No algorithm selected');
  }

  const did = `did:ethr:sepolia:${selectedKey.meta?.account.address}`;

  const credential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: did },
      credentialSubject,
    },
    proofFormat: selectedAlgorithm,
  });
  console.log('Credential created');
  return credential;
}

async function validateCredential(
  agent: ConfiguredAgent,
  verifiableCredential: VerifiableCredential
): Promise<boolean> {
  if (!agent) {
    throw new Error('Agent not initialized');
  }

  if (!verifiableCredential) {
    throw new Error('No credential selected');
  }
  console.log('Verifying credential:', verifiableCredential);
  const result = await agent.verifyCredential({
    credential: verifiableCredential,
  });
  console.log('Verification result:', result);
  return result.verified;
}

async function createVerifiablePresentation(
  agent: ConfiguredAgent,
  selectedKey: ManagedKeyInfo,
  verifiableCredential: VerifiableCredential,
  selectedAlgorithm: string
): Promise<VerifiablePresentation> {
  if (!agent) {
    throw new Error('Agent not initialized');
  }

  if (!selectedKey) {
    throw new Error('No key selected');
  }

  if (!verifiableCredential) {
    throw new Error('No verifiable credential');
  }

  if (selectedAlgorithm === '') {
    throw new Error('No algorithm selected');
  }

  const did = `did:ethr:sepolia:${selectedKey.meta?.account.address}`;
  const presentation = await agent.createVerifiablePresentation({
    presentation: {
      holder: did,
      verifiableCredential: [verifiableCredential],
    },
    proofFormat: selectedAlgorithm,
  });
  console.log('Created Presentation:', presentation);
  return presentation;
}

async function validatePresentation(
  agent: ConfiguredAgent,
  verifiablePresentation: VerifiablePresentation
): Promise<boolean> {
  if (!agent) {
    throw new Error('Agent not initialized');
  }

  if (!verifiablePresentation) {
    throw new Error('No presentation selected');
  }

  const result = await agent.verifyPresentation({
    presentation: verifiablePresentation,
  });

  return result.verified;
}export {
  type ConfiguredAgent,
  issueCredential,
  validateCredential,
  createVerifiablePresentation,
  validatePresentation,
  getDidDocument,
 
};