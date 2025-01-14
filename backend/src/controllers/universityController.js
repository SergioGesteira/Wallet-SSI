import { agent } from '../services/veramoAgent.js'; // Importar el agente Veramo

let pendingDIDs = []; // Lista de DIDs pendientes
let trustedDIDs = []; // Lista de DIDs confiables
let rejectedDIDs = []; // Lista de DIDs rechazados
let didStatus = {};
let storedJwt = ''; // JWT almacenado
let storedVerifiableCredential = ''; // Verifiable Credential almacenado

// Send DID to the server 
export const handleSendDid = async (req, res) => {
  const { did } = req.body;

  if (!did) {
    return res.status(400).json({ success: false, message: 'DID is required' });
  }

  try {
    const resolvedDid = await agent.resolveDid({ didUrl: did });
    if (!resolvedDid || !resolvedDid.didDocument) {
      return res.status(400).json({ success: false, message: 'DID could not be resolved' });
    }

    pendingDIDs.push(did);
    return res.status(200).json({ success: true, message: 'DID submitted successfully' });
  } catch (error) {
    console.error('Error resolving DID:', error);
    return res.status(500).json({ success: false, message: 'Error resolving DID' });
  }
};
// Approve DID
export const approveDid = async (req, res) => {
  const { did, address } = req.body;

  if (!did || !pendingDIDs.includes(did)) {
    return res.status(400).json({ success: false, message: 'DID not found in pending list' });
  }

  // Mover el DID de pendientes a la lista de confiables
  pendingDIDs = pendingDIDs.filter(d => d !== did);
  trustedDIDs.push(did);
  return res.status(200).json({
    success: true,
    message: `DID ${did} approved`,
  });
};


// Reject DID
export const rejectDid = (req, res) => {
  const { did } = req.body;

  if (!did || !pendingDIDs.includes(did)) {
    return res.status(400).json({ success: false, message: 'DID not found in pending list' });
  }

  pendingDIDs = pendingDIDs.filter(d => d !== did);
  rejectedDIDs.push(did);
  didStatus[did] = 'rejected'; // Update the status of the DID
  return res.status(200).json({ success: true, message: `DID ${did} rejected` });
};

// send presentation JWT
export const sendPresentationJwt = (req, res) => {
  const { jwt } = req.body;


  if (!jwt) {
    return res.status(400).json({ success: false, message: 'JWT is required' });
  }

  storedJwt = jwt; 
  return res.status(200).json({ success: true, message: 'JWT sent successfully' });
};

export const getStoredJwt = (req, res) => {
  if (!storedJwt) {
    return res.status(404).json({ success: false, message: 'No JWT found' });
  }

  const jwt = storedJwt;
  storedJwt = null; // Clear the stored JWT after retrieval

  return res.status(200).json({ success: true, jwt });
};
// send verifiable credential
export const sendVerifiableCredential = (req, res) => {
  const { verifiableCredential } = req.body;


  if (!verifiableCredential) {
    return res.status(400).json({ success: false, message: 'Verifiable Credential is required' });
  }

  storedVerifiableCredential = verifiableCredential;
  return res.status(200).json({ success: true, message: 'Verifiable Credential sent successfully' });
};

// Ruta para obtener los DIDs pendientes
export const getPendingDIDs = (req, res) => {
  return res.status(200).json({ success: true, pendingDIDs });
};



//get the verifiable credential
export const getStoredVerifiableCredential = (req, res) => {
  if (!storedVerifiableCredential) {
    return res.status(404).json({ success: false, message: 'No Verifiable Credential found' });
  }

  const verifiableCredential = storedVerifiableCredential;
  storedVerifiableCredential = null; // Clear the stored Verifiable Credential after retrieval

  return res.status(200).json({ success: true, verifiableCredential });
};

// Get the status of a DID
export const getDidStatus = (req, res) => {
  const { did } = req.query;

  if (!did) {
    return res.status(400).json({ success: false, message: 'DID is required' });
  }

  const status = didStatus[did] || 'pending';
  return res.status(200).json({ success: true, status });
};