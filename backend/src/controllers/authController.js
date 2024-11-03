// controllers/authController.js
import { generateNonce } from '../utils/utils.js';
import agentService from '../services/veramoAgent.js';
import veramoAgent from '../services/veramoAgent.js';

export const getNonce = (req, res) => {
    const nonce = generateNonce();
    req.session.nonce = nonce;
    res.json({ nonce });
};

export const verifyPresentation = async (req, res) => {
    const { jwt: verifiablePresentation, nonce } = req.body;
    if (!verifiablePresentation || !nonce) {
        return res.status(400).json({ message: 'Verifiable presentation is missing.' });
    }
    if (nonce !== req.session.nonce) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }
    req.session.nonce = null;

    try {
        const { credential, claims, didDocument, hasAccess } = await veramoAgent.verifyPresentation(verifiablePresentation);
        if (hasAccess) {
            return res.status(200).json({ message: 'Access granted. Welcome!', credential, claims, didDocument });
        }
        return res.status(403).json({ message: 'Access denied. Invalid college.' });
    } catch (err) {
        console.error('Error verifying presentation:', err);
        return res.status(500).json({ message: 'Error verifying presentation' });
    }
};
