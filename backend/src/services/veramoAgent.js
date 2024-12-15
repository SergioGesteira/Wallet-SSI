// services/veramoAgent.js
import { config } from 'dotenv';

config(); // Esto carga las variables de entorno desde .env
// ===================== VERAMO CONSTANTS =====================
import { createAgent } from '@veramo/core';


import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { ethers } from 'ethers';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { parseJWT } from '../utils/utils.js';

// Set up Ethereum provider for Sepolia testnet
const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");

// Initialize the Key Management System (KMS) using Web3
const kms = new Web3KeyManagementSystem({ eip1193: provider });
const keys = [];


// Specify registry addresses for mainnet and sepolia networks
const registries = {
    mainnet: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
    sepolia: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
};

// Initialize in-memory stores for DIDs and keys
const didStore = new MemoryDIDStore();
const keyStore = new MemoryKeyStore();

// Create the Veramo agent with configured plugins
export const agent = createAgent({
    plugins: [
        // Key management using the Web3 KMS
        new KeyManager({
            store: keyStore,
            kms: {
                web3: kms,
            },
        }),
        // DID management for Ethereum-based DIDs on mainnet and Sepolia
        new DIDManager({
            store: didStore,
            defaultProvider: 'did:ethr:sepolia',
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
        // DID resolver plugin for resolving DIDs on mainnet and Sepolia
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
        // Credential issuance and verification plugin for W3C and EIP712 credentials
        new CredentialPlugin({
            issuers: [new CredentialProviderEIP712(), new CredentialProviderEip712JWT()],
        }),
     
    ]
});

export async function importUniversityDID() {
    try {
       
//         const did = `did:ethr:sepolia:${address}`;

//  // Importar el DID utilizando el KMS Web3
//  const importedDid = await agent.didManagerImport({
//     did,
//     controllerKeyId: key.kid,
//     provider: 'did:ethr:sepolia',
//     keys: [
//         {
//             kid: key.kid,
//             type: 'Secp256k1',
//             kms: 'web3',
//             publicKeyHex: key.publicKeyHex,
//             meta: key.meta,
//             privateKeyHex: '',
//         },
//     ],
// });

// console.log('DID de la universidad importado exitosamente:', importedDid);

// return importedDid;
// } catch (error) {
// console.error('Error al importar el DID de la universidad:', error);
// throw error;
// }
// }



        const privateKey = process.env.PRIVATE_KEY || ''; 

           // Import the DID of the university
           const didImportResult = await agent.didManagerImport({
            did: 'did:ethr:sepolia:0x0EbbDF0f0518EBD772D81B3bdA684e3F67917A03',
            keys: [
                {
                    type: 'Secp256k1',
                    privateKeyHex: '',
                    kms: 'web3',
                    kid: 'did:ethr:sepolia:0x0EbbDF0f0518EBD772D81B3bdA684e3F67917A03#controller',
                    meta: {
                        algorithms: ['eth_signTypedData', 'ES256K-R'],
                    }
                },
            ],
        });

        const identity = await agent.didManagerGet({
            did: 'did:ethr:sepolia:0x0EbbDF0f0518EBD772D81B3bdA684e3F67917A03',
          })
          console.log(`Get identity`)
          console.log('Claves disponibles:', identity.keys);
            console.log(identity.did)
            let did = await agent.resolveDid({ didUrl: identity.did })
            console.log(did)
    
            
        //     // Verificar si existe una clave con privateKeyHex definido
        //     const signingKey = identifier.keys.find((key) => key.privateKeyHex);
            
        //     if (!signingKey) {
        //         throw new Error('No se encontró una clave válida con privateKeyHex.');
        //     }
        //     console.log('Clave seleccionada para firmar:', signingKey);

        // // console.log('DID de la universidad importado exitosamente.', didImportResult);
        // console.log('-------------Create Key--------------------') only one time
        // // Add the key to the DID after import
        // const key = await agent.keyManagerCreate({
        //     kms: 'web3',
        //     type: 'Secp256k1',
        //   })
        //   console.log('Key created:', key)
        //   console.log('-------------Add Key to DID --------------------')
        //   const result = await agent.didManagerAddKey({
        //     did: identity.did,
        //     key,
        //   })
        console.log('Clave añadida al DID de la universidad exitosamente.', result);
    } catch (error) {
        console.error('Error importando el DID o añadiendo clave:', error);
    }
}

  



  


// Function to verify a verifiable presentation
export const verifyPresentation = async (verifiablePresentation) => {
    const result = await agent.verifyPresentation({ presentation: verifiablePresentation });
    const jwtToken = result.verifiablePresentation.jwt;
    const decodedPayload = parseJWT(jwtToken);
    const verifiableCredential = decodedPayload.vp.verifiableCredential;

    // Decode each verifiable credential from the presentation
    const decodedCredential = verifiableCredential.map(parseJWT);
    const claims = decodedCredential.map(vc => vc.vc.credentialSubject);
    const didDocument = decodedCredential[0].vc.credentialSubject.id;

    // Check if the user has access based on a claim for a specific institution
    const hasAccess = claims.some(claim => claim.college === 'EETAC');

    return { credential: decodedCredential, claims, didDocument, hasAccess };
};

export default { verifyPresentation , agent, importUniversityDID};
