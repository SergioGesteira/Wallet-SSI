import { ConfiguredAgent} from './utils';
import { createAgent, IDIDManager, IResolver, ICredentialPlugin, IDataStore, IKeyManager } from '@veramo/core';
import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { KeyManager, MemoryKeyStore } from '@veramo/key-manager';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { BrowserProvider } from 'ethers';
import {
    ManagedKeyInfo,
  } from '@veramo/core';

const browserProvider = new BrowserProvider(window.ethereum);
const agent: ConfiguredAgent | null = null;
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

   export const veramoAgent:ConfiguredAgent= createAgent<IDIDManager & IResolver & ICredentialPlugin & IDataStore & IKeyManager>({
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
      ],
    });
    console.log('Agent created: ', veramoAgent);

    export { veramoAgent as agent };