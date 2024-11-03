// services/agentService.js
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
import { ethers } from 'ethers';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { parseJWT } from '../utils/utils.js';

const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org")
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
     
    ]
});


export const verifyPresentation = async (verifiablePresentation) => {
    const result = await agent.verifyPresentation({ presentation: verifiablePresentation });
    const jwtToken = result.verifiablePresentation.jwt;
    const decodedPayload = parseJWT(jwtToken);
    const verifiableCredential = decodedPayload.vp.verifiableCredential;
    const decodedCredential = verifiableCredential.map(parseJWT);
    const claims = decodedCredential.map(vc => vc.vc.credentialSubject);
    const didDocument = decodedCredential[0].vc.credentialSubject.id;
    const hasAccess = claims.some(claim => claim.college === 'EETAC');
    return { credential: decodedCredential, claims, didDocument, hasAccess };
};

export default { verifyPresentation };
