import { generateNonce } from '../utils/utils.js';
import veramoAgent from '../services/veramoAgent.js';
import jwtoken from 'jsonwebtoken';




export const parseJWT = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error("The token is not a valid JWT.");
  }
  return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
};


// Controller to generate a nonce for the client
export const getNonce = async (req, res) => {
    try {
        const nonce = generateNonce(); // Generate a unique nonce
        req.session.nonce = nonce; 
        console.log('nonce saved in session:', req.session.nonce);
       
        res.json({ nonce }); // Send nonce to client
     
    } catch (err) {
        console.error('Error generating nonce:', err);
        return res.status(500).json({ message: 'Error generating nonce' });
    }
};

// Controller to verify the user's verifiable presentation
export const verifyPresentation = async (req, res) => {
    
    //const { jwt: verifiablePresentation , nonce} = req.body;
    const { jwt: verifiablePresentation } = req.body;

    if (!verifiablePresentation ) {
        return res.status(400).json({ message: 'Missing verifiable presentation or nonce.' });
    }

    //const noncefrontend = nonce;
    
    try {
        // Verify the verifiable presentation using Veramo
        const { credential, claims, didDocument, hasAccess } = await veramoAgent.verifyPresentation(verifiablePresentation);

        const parsedPayload = parseJWT(verifiablePresentation);
        // Extract nonce from the verifiable presentation
        const nonce = parsedPayload.nonce;
        console.log('Received nonce from presentation:', nonce);
        console.log('Stored nonce in session:', req.session.nonce);

         // Verify nonce
        if (nonce !== req.session.nonce) {
            return res.status(403).json({ message: 'Invalid nonce' });
        }
  
      // Invalidate nonce after use to prevent reuse attacks
        req.session.nonce = null;
 

        const currentTime = Math.floor(Date.now() / 1000);
        console.log('currentTime:', currentTime);
        const nbf = parsedPayload.nbf;
        console.log('nbf:', nbf);
        // Verify timestamp (5 minutes = 300 seconds)
        if (currentTime - nbf > 300) {
            const expiredTime = currentTime - nbf - 300;
            return res.status(403).json({ message: `Presentation has expired. It expired ${expiredTime} seconds ago.` });
        }
       
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
