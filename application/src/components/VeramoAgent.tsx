// veramoAgent.ts

import { Web3KeyManagementSystem } from '@veramo/kms-web3';
import { KeyManager } from '@veramo/key-manager';
import { createAgent, IKeyManager, ICredentialPlugin, IResolver, IDataStore, IDIDManager } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { MemoryKeyStore } from '@veramo/key-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { Resolver } from 'did-resolver';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderEIP712 } from '@veramo/credential-eip712';
import { CredentialProviderEip712JWT } from 'credential-eip712jwt';
import { BrowserProvider } from 'ethers';

// Esta función inicializa y devuelve el agente Veramo.
export const createVeramoAgent = async (kms: Web3KeyManagementSystem, browserProvider: BrowserProvider) => {
  const registries = {
    mainnet: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
    sepolia: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
  };

  const didStore = new MemoryDIDStore();
  const keyStore = new MemoryKeyStore();

  const veramoAgent = createAgent<IDIDManager & IResolver & ICredentialPlugin & IDataStore & IKeyManager>({
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

  console.log('Veramo Agent creado');
  return veramoAgent;
};
