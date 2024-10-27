// import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import crypto from 'crypto';
import express from 'express';
import bodyParser from 'body-parser';
const port = process.env.PORT || 5000;
import session from 'express-session';
// import logger from 'morgan';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();
// ===================== VERAMO CONSTANTS =====================
import { createAgent } from '@veramo/core';
//import { IDIDManager, IResolver, ICredentialPlugin, IDataStore, IKeyManager, TAgent } from '@veramo/core';

import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { SelectiveDisclosure } from '@veramo/selective-disclosure';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';

import { migrations, Entities } from '@veramo/data-store';

import { BrowserProvider } from 'ethers';

const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org")
//type ConfiguredAgent = TAgent<IDIDManager & IResolver & ICredentialPlugin & IDataStore & IKeyManager>;

// let browserProvider 

// function setupBrowserProvider() {
//     if (typeof window.ethereum !== 'undefined') {
//         import ('ethers').then(({default: BrowserProvider}) => BrowserProvider())
        
//     } else {
//         console.error('MetaMask no está instalada');
//     }
// }

// setupBrowserProvider();

// ===================== MIDDLEWARE CONFIGURATION =====================
const app = express();
app.use(express.json()); // needed to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // needed to retrieve html form fields
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }, // Solo cookies seguras en producción
}));
app.use(passport.initialize()); // we load the passport auth middleware to our express application. It should be loaded before any route.
app.use(passport.session());

const DATABASE_FILE = 'database.sqlite';
import { DataSource } from 'typeorm';
import { ethers } from 'ethers';
const dbConnection = new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities
});
dbConnection.initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
})
    .catch((err) => {
    console.error('Error during Data Source initialization:', err);
});


const kms = new Web3KeyManagementSystem({ eip1193: provider }); // Usa el proveedor configurado aquí
const keys = [];
keys.forEach(async (key) => {
    const did = `did:ethr:sepolia:${key.meta?.account.address}`;
    const importedDid = await agent.didManagerImport({
        did,
        controllerKeyId: key.kid,
        provider: 'did:ethr:sepolia',
        keys: [
            {
                kid: key.kid,
                type: 'Secp256k1',
                kms: 'web3',
                publicKeyHex: key.publicKeyHex,
                meta: key.meta,
                privateKeyHex: '',
            },
        ],
    });
    console.log('DID created: ', importedDid);

});
const registries = {
    mainnet: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
    sepolia: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
};
const didStore = new MemoryDIDStore();
const keyStore = new MemoryKeyStore();
const agent = createAgent({
    plugins: [
        new KeyManager({
            store: keyStore,
            kms: {
                web3: kms,
            },
        }),
        new DIDManager({
            store: didStore,
            defaultProvider: 'did:ethr',
            providers: {
                'did:ethr': new EthrDIDProvider({
                    defaultKms: 'web3',
                    registry: registries['mainnet'],
                    web3Provider: provider,
                }),
                'did:ethr:sepolia': new EthrDIDProvider({
                    defaultKms: 'web3',
                    registry: registries['sepolia'],
                    web3Provider: provider,
                }),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver(
              getEthrDidResolver({
                networks: [
                  {
                    name: 'mainnet',
                    registry: registries['mainnet'],
                    provider: provider,
                  },
                  {
                    name: 'sepolia',
                    registry: registries['sepolia'],
                    provider: provider,
                  },
                ],
              })
            ),
          }),
        new CredentialPlugin({
            issuers: [new CredentialProviderEIP712(), new CredentialProviderEip712JWT()],
        }),
        new SelectiveDisclosure(),
    ]
});
// Generar un nonce


 
// Define la función validatePresentation
function parseJWT(token) {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
        throw new Error("El token no es un JWT válido.");
    }

    // Decodificar el payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload;
}


/*-------------------------------------------------------------ROUTEHANDLERS------------------------------------------------------------------------ */
//LOGIN 
app.get('/', (req, res) => {
    res.send('¡Hola, mundo!'); // Respuesta para la ruta '/'
});
app.get('/login', (req, res) => {
    const nonce = crypto.randomBytes(16).toString('hex'); // Generates a nonce
    req.session.nonce = nonce; // Stores nonce in user's session
    res.sendFile('login.html', { root: __dirname }); // Enviamos el HTML
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
app.post('/verifyPresentation', async (req, res) => {

    const { jwt: verifiablePresentation } = req.body;
   

    if (!verifiablePresentation) {
        return res.status(400).json({ message: 'Verifiable presentation is missing.' });
    }

    
    try {

        // Paso 2: Usar Veramo para verificar la presentación
        const result = await agent.verifyPresentation({ 
            presentation: verifiablePresentation,
        });
        // console.log('Result:', JSON.stringify(result, null, 2));
        const jwtToken = result.verifiablePresentation.jwt;
        // console.log('vc:', jwtToken);
        const decodedPayload = parseJWT(jwtToken);
        console.log("Payload decodificado:", decodedPayload);
        const verifiableCredential = decodedPayload.vp.verifiableCredential;
        console.log("Verifiable Credentials:", verifiableCredential);
        const decodedCredential = verifiableCredential.map(parseJWT);
        console.log("Verifiable Credentials:", decodedCredential);

        const claims = decodedCredential.map(vc => vc.vc.credentialSubject);
        claims.forEach((claim, index) => {
            console.log(`Claims de Credential ${index + 1}:`, JSON.stringify(claim, null, 2));
        });

        
          
        
           
            return res.status(200).json({ message: 'Presentation is valid'});
        
        
        // Si todo es correcto
        
        // // Verificar que el nonce coincide
        // if (jwt.nonce !== nonce) {
        //     res.status(400).json({ message: 'Invalid nonce' });
        //     return;
        // }
        // // Verificar que el timestamp no sea demasiado antiguo (por ejemplo, no más de 5 minutos)
        // const currentTimestamp = Math.floor(Date.now() / 1000);
        // const vpTimestamp = payload.iat; // Usamos `iat` (issued at) como timestamp
        // const FIVE_MINUTES_IN_SECONDS = 300; // 5 minutos
        // if (currentTimestamp - vpTimestamp > FIVE_MINUTES_IN_SECONDS) {
        //     res.status(400).json({ message: 'Presentation timestamp is too old' });
        //     return;
        // }
        // // Si todo es válido, guarda el DID, nonce y timestamp en la base de datos
        // const did = jwt.iss; // El `iss` es el DID del emisor
        // const exp = jwt.exp || (currentTimestamp + FIVE_MINUTES_IN_SECONDS); // Establece un tiempo de expiración si no hay uno
        // // Guardar en la base de datos (asume que tienes una tabla `sessions`)
      //  await dbConnection.query('INSERT INTO sessions (did, nonce, timestamp, exp) VALUES (?, ?, ?, ?)', [did, nonce, vpTimestamp, exp]);
        // Redirige al usuario a la página de bienvenida
        res.redirect('/welcome');
    
    }
    catch (err) {
        console.error('Error verifying presentation:', err);
        console.log('error verifying:',jwt);
        return res.redirect('/login');
 
    }
});
app.get('/welcome', (req, res) => {
    res.send('<h1>Bienvenido!</h1>');
});
