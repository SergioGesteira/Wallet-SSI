import express from 'express';
import { handleSendDid, approveDid, rejectDid, getPendingDIDs,  sendPresentationJwt, getStoredJwt, sendVerifiableCredential, getStoredVerifiableCredential} from '../controllers/universityController.js';


const router = express.Router();

// Ruta para recibir un DID
router.post('/sendDid', handleSendDid);
// Ruta para aprobar un DID
router.post('/approveDid', approveDid);
// Ruta para rechazar un DID
router.post('/rejectDid', rejectDid);
// Ruta para obtener los DIDs pendientes
router.get('/pendingDIDs', getPendingDIDs);
router.post('/sendJwt', sendPresentationJwt);
router.get('/getStoredJwt', getStoredJwt);
router.post('/sendVerifiableCredential', sendVerifiableCredential);
router.get('/getStoredVerifiableCredential', getStoredVerifiableCredential);



export default router;