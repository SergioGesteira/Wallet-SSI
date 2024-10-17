const cors = require('cors')
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
var bodyParser = require('body-parser')
const https = require('https');
const session = require('express-session');
const fs = require('fs');
const logger = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const scrypt = require('scrypt-mcf');
const sqlite3 = require('sqlite3').verbose();
const JwtStrategy = require('passport-jwt').Strategy;
const axios = require('axios');
const jwtSecret = require('crypto').randomBytes(16).toString('base64'); // Generate random bytes and convert to base64
//.env config
const dotenv = require('dotenv');
dotenv.config()

// ===================== VERAMO CONSTANTS =====================
import { createAgent, IDIDManager, IResolver, ICredentialPlugin, IDataStore, IKeyManager } from '@veramo/core';
import { Web3KeyManagementSystem} from '@veramo/kms-web3';
import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { ISelectiveDisclosure, SelectiveDisclosure, SdrMessageHandler } from '@veramo/selective-disclosure';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';

import { KeyStore, PrivateKeyStore, DIDStore, migrations, Entities } from '@veramo/data-store';
import {
  DIDResolutionResult,
  ManagedKeyInfo,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core';
import { BrowserProvider } from 'ethers';
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

  const browserProvider = new BrowserProvider(window.ethereum);

  const kms: Web3KeyManagementSystem | null = null;
  const keys: ManagedKeyInfo[] = [];

    keys.forEach(async (key) => {
      const did = `did:ethr:sepolia:${key.meta?.account.address}`;
      const importedDid = await agent!.didManagerImport({
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
      const test = await agent!.resolveDid({ didUrl: did });
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
          web3: kms!,
        },
      }),
      new DIDManager({
        store: didStore,
        defaultProvider: 'did:ethr',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'web3',
            registry: registries['mainnet'],
            web3Provider: browserProvider,
          }),
          'did:ethr:sepolia': new EthrDIDProvider({
            defaultKms: 'web3',
            registry: registries['sepolia'],
            web3Provider: browserProvider,
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
                provider: browserProvider,
                signer: browserProvider.getSigner(),
              },
              {
                name: 'sepolia',
                registry: registries['sepolia'],
                provider: browserProvider,
                signer: browserProvider.getSigner(),
              },
            ],
          })
        ),
      }),
      new CredentialPlugin({
        issuers: [new CredentialProviderEIP712(), new CredentialProviderEip712JWT()],
      }),
      new SelectiveDisclosure()
    ]
  })

// ===================== EXPRESS APP CONFIGURATION =====================
//   app.use(cors({origin: 'http://localhost:3000'}))
//   app.use(bodyParser.urlencoded({ extended: true })) // needed to retrieve html form fields
//   app.use(bodyParser.json()) // github
//   app.use(cookieParser())
//   app.use(logger('dev'))
//   app.use(session({
//     secret: 'example secret',
//     resave: false,
//     saveUninitialized: false,
//   }))
//   app.use(passport.initialize()) // we load the passport auth middleware to our express application. It should be loaded before any route.
//   app.use(passport.session())
//   app.use(function (err, req, res, next) {
//     console.error(err.stack)
//     res.status(500).send('Something broke!')
//   })



// // Import routes
// import authRoutes from './routes/auth';




// // Middleware
// app.use();
// app.use(passport.initialize());

// // Routes
// app.use('/auth', authRoutes);

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
