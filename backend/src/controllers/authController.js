import { generateNonce } from '../utils/utils.js';
import veramoAgent from '../services/veramoAgent.js';
import jwtoken from 'jsonwebtoken';

// Controller to generate a nonce for the client
export const getNonce = (req, res) => {
    try {
        const nonce = generateNonce(); // Generate a unique nonce
        req.session.nonce = nonce; // Store nonce in session for validation later
        res.json({ nonce }); // Send nonce to client
    } catch (err) {
        console.error('Error generating nonce:', err);
        return res.status(500).json({ message: 'Error generating nonce' });
    }
};

// Controller to verify the user's verifiable presentation
export const verifyPresentation = async (req, res) => {
    const { jwt: verifiablePresentation, nonce } = req.body;

    // Validate incoming data
    if (!verifiablePresentation || !nonce) {
        return res.status(400).json({ message: 'Verifiable presentation is missing.' });
    }
    if (nonce !== req.session.nonce) {
        return res.status(403).json({ message: 'Invalid nonce' });
    }
    // Invalidate nonce after use to prevent reuse attacks
    req.session.nonce = null;

    try {
        // Verify the verifiable presentation using Veramo
        const { credential, claims, didDocument, hasAccess } = await veramoAgent.verifyPresentation(verifiablePresentation);

        // Check if the user has the necessary access
        if (hasAccess) {
            // Generate a JWT token for the authenticated session
            const payload = { did: didDocument };
            const token = jwtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                message: 'Access granted. Welcome!',
                token, // Return JWT token to client
                credential, // Include credential data
                claims, // Include claims data
                didDocument // Include DID document data
            });
        }

        return res.status(403).json({ message: 'Access denied. Invalid college or credentials.' });
    } catch (err) {
        console.error('Error verifying presentation:', err);
        return res.status(500).json({ message: 'Error verifying presentation. Please try again later.' });
    }
};
