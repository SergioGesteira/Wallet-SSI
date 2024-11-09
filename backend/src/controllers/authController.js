import { generateNonce } from '../utils/utils.js';

import veramoAgent from '../services/veramoAgent.js';

export const getNonce = (req, res) => {
    try {
        const nonce = generateNonce();
        req.session.nonce = nonce;
        res.json({ nonce });
    } catch (err) {
        console.error('Error generating nonce:', err);
        return res.status(500).json({ message: 'Error generating nonce' });
    }
};

export const verifyPresentation = async (req, res) => {
    const { jwt: verifiablePresentation, nonce } = req.body;
    if (!verifiablePresentation || !nonce) {
        return res.status(400).json({ message: 'Verifiable presentation is missing.' });
    }
    if (nonce !== req.session.nonce) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }
  // Invalidate nonce after use
    req.session.nonce = null;

    try {
        // Verify presentation with Veramo
        const { credential, claims, didDocument, hasAccess } = await veramoAgent.verifyPresentation(verifiablePresentation);

        // if (!credential || !claims || !didDocument) {
        //     return res.status(400).json({ message: 'Invalid verifiable credential format. Could not extract claims or DID Document.' });
        // }

        // Verify user access
        if (hasAccess) {
            return res.status(200).json({
                message: 'Access granted. Welcome!',
                credential,
                claims,
                didDocument
            });
        }

        return res.status(403).json({ message: 'Access denied. Invalid college or credentials.' });
    } catch (err) {
        console.error('Error verifying presentation:', err);
        return res.status(500).json({ message: 'Error verifying presentation. Please try again later.' });
    }
};
