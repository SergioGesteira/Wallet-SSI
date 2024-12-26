import { agent } from '../services/veramoAgent.js'; // Importar el agente Veramo

let pendingDIDs = []; // Lista de DIDs pendientes
let trustedDIDs = []; // Lista de DIDs confiables
let storedJwt = ''; // JWT almacenado

// Ruta para enviar un DID al servidor
export const handleSendDid = (req, res) => {
  const { did } = req.body;

  if (!did) {
    return res.status(400).json({ success: false, message: 'DID is required' });
  }

  pendingDIDs.push(did);
  return res.status(200).json({ success: true, message: 'DID submitted successfully' });
};

// Ruta para aprobar un DID
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


// Ruta para rechazar un DID
export const rejectDid = (req, res) => {
  const { did } = req.body;

  if (!did || !pendingDIDs.includes(did)) {
    return res.status(400).json({ success: false, message: 'DID not found in pending list' });
  }

  // Eliminar el DID de la lista de pendientes
  pendingDIDs = pendingDIDs.filter(d => d !== did);

  return res.status(200).json({ success: true, message: `DID ${did} rejected` });
};

// Ruta para obtener los DIDs pendientes
export const getPendingDIDs = (req, res) => {
  return res.status(200).json({ success: true, pendingDIDs });
};

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

  return res.status(200).json({ success: true, jwt: storedJwt });
};