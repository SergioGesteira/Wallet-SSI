// import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
//import jwt from 'jsonwebtoken'; 
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
//import { VerifiablePresentation } from '@veramo/core';
import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';

// import { DIDResolverPlugin } from '@veramo/did-resolver';
// import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
// import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { SelectiveDisclosure } from '@veramo/selective-disclosure';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { migrations, Entities } from '@veramo/data-store';

import { BrowserProvider } from 'ethers';

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


const kms = null;
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
    const test = await agent.resolveDid({ didUrl: did });
    console.log('DID resolved: ', test);
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
                    web3Provider: !BrowserProvider,
                }),
                'did:ethr:sepolia': new EthrDIDProvider({
                    defaultKms: 'web3',
                    registry: registries['sepolia'],
                    web3Provider: !BrowserProvider,
                }),
            },
        }),
        // new DIDResolverPlugin({
        //     resolver: new Resolver(getEthrDidResolver({
        //         networks: [
        //             {
        //                 name: 'mainnet',
        //                 registry: registries['mainnet'],
        //                 provider: !BrowserProvider,
        //                 signer: !BrowserProvider.getSigner(),
        //             },
        //             {
        //                 name: 'sepolia',
        //                 registry: registries['sepolia'],
        //                 provider: !BrowserProvider,
        //                 signer: BrowserProvider.getSigner(),
        //             },
        //         ],
        //     })),
        // }),
        new CredentialPlugin({
            issuers: [new CredentialProviderEIP712(), new CredentialProviderEip712JWT()],
        }),
        new SelectiveDisclosure(),
    ]
});

// // Routes
// app.use('/auth', authRoutes);

// Define la función validatePresentation
async function validatePresentation(agent, verifiablePresentation) {
   
    if (!agent) {
        throw new Error('Agent not initialized');
    }

    // Verifica que la presentación verificable no esté vacía
    if (!verifiablePresentation) {
        throw new Error('No presentation selected');
    }

    // Verifica la presentación
    const result = await agent.verifyPresentation({
        presentation: verifiablePresentation,
    });

    // Devuelve true si la presentación es válida, false en caso contrario
    return result.verified; 
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
app.get('/getSelectiveDisclosure', (req, res) => {
   agent.createSelectiveDisclosureRequest({
        data: {
            claims: [
                { claimType: 'alumni', essential: true },
                { claimType: 'degree', claimValue: 'Telecom Engineer', essential: true },
                { claimType: 'expDate', claimValue: '2024-10-23T00:00:00Z', essential: true },
            ],
        },
    })
        .then(async (JWT) => {
            const message = await agent.handleMessage({
                raw: JWT,
                save: true,
            });
            res.status(200).json({ message: 'Selective Disclosure created successfully!', data: message });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Selective Disclosure could not be created.', error: err.message });
        });
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
app.post('/verifyPresentation', async (req, res) => {

    const { jwt } = req.body;
    const nonce = req.session.nonce;
    try {
        const isValid = await validatePresentation(agent, jwt);
        if (!isValid) {
            console.log('error verifying:',isValid);
            return res.redirect('/login');
        }
        else{
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
