// utils/utils.js
import crypto from 'crypto';


export const generateNonce = () => crypto.randomBytes(16).toString('hex');


export const parseJWT = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error("El token no es un JWT válido.");
    }
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
};
