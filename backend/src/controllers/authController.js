import { generateNonce } from '../utils/utils.js';
import veramoAgent from '../services/veramoAgent.js';
import jwtoken from 'jsonwebtoken';
// import { setInRedis } from '../config/redisConfig.js'; 
// import { getFromRedis } from '../config/redisConfig.js';



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
        console.log('nonce generado y almacenado en session:', req.session.nonce);
        // await setInRedis(`nonce:${nonce}`, nonce); // Store nonce in session for validation later
        // console.log('nonce generado y almacenado en Redis:', nonce);
        res.json({ nonce }); // Send nonce to client
     
    } catch (err) {
        console.error('Error generating nonce:', err);
        return res.status(500).json({ message: 'Error generating nonce' });
    }
};

// Controller to verify the user's verifiable presentation
export const verifyPresentation = async (req, res) => {
    // const { jwt: verifiablePresentation } = req.body;

    const { jwt: verifiablePresentation , nonce} = req.body;

    if (!verifiablePresentation || !nonce) {
        return res.status(400).json({ message: 'Missing verifiable presentation or nonce.' });
    }

    const noncefrontend = nonce;
    console.log('noncefrontend:', noncefrontend);

    
    console.log('Nonce almacenado en sesión:', req.session ? req.session.nonce : 'No session data');  
    console.log ('req.session.nonce', req.session.nonce);
  

    try {
        // Verify the verifiable presentation using Veramo
        const { credential, claims, didDocument, hasAccess } = await veramoAgent.verifyPresentation(verifiablePresentation);

        const parsedPayload = parseJWT(verifiablePresentation);
 

        const currentTime = Math.floor(Date.now() / 1000);
        console.log('currentTime:', currentTime);
        const nbf = parsedPayload.nbf;
        console.log('nbf:', nbf);
        // Verify timestamp (5 minutes = 300 seconds)
        if (currentTime - nbf > 300) {
            return res.status(403).json({ message: 'Presentation has expired.' });
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
