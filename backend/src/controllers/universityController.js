import { agent } from '../services/veramoAgent.js'; // Importar el agente Veramo

let pendingDIDs = []; // Lista de DIDs pendientes
let trustedDIDs = []; // Lista de DIDs confiables

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

  try {
    // Define la claim del credencial
    const credentialSubject = {
      id: did, // Se emite el credencial contra este DID
      college: 'EETAC',
      accessLevel: 'student',
    };

    // Emite el credencial firmado
    const signedCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: 'did:ethr:sepolia:0x0EbbDF0f0518EBD772D81B3bdA684e3F67917A03' },
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject,
      },
      proofFormat: 'EthTypedDataSignature',
    });

    // Crear una presentación verificable (VP)
    const verifiablePresentation = await agent.createVerifiablePresentation({
      presentation: {
        holder: did,
        verifiableCredential: [signedCredential],
      },
      proofFormat: 'EthTypedDataSignature',
    });

    return res.status(200).json({
      success: true,
      message: `DID ${did} approved`,
      signedCredential,
      verifiablePresentation,
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    return res.status(500).json({ success: false, message: 'Failed to issue credential.' });
  }
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