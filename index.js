import { unixfs } from '@helia/unixfs'
import { ipns as createIPNS } from '@helia/ipns'
import { createHelia } from 'helia'
import { generateKeyPair } from '@libp2p/crypto/keys'
import { autoTLS } from '@libp2p/auto-tls'
import { autoNAT } from '@libp2p/autonat'
import { dcutr } from '@libp2p/dcutr'
import { kadDHT } from '@libp2p/kad-dht'
import { createDelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { ipnsSelector } from 'ipns/selector'
import { ipnsValidator } from 'ipns/validator'
import { identify, identifyPush } from '@libp2p/identify'
import { keychain } from '@libp2p/keychain'
import { ping } from '@libp2p/ping'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { uPnPNAT } from '@libp2p/upnp-nat'
import { delegatedHTTPRoutingDefaults } from '@helia/routers'

const agentVersion = 'rangermauve/helia-ipns-test'

const helia = await createHelia({
  libp2p: {
    services: {
      autoNAT: autoNAT(),
      autoTLS: autoTLS(),
      dcutr: dcutr(),
      delegatedRouting: () => createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev', delegatedHTTPRoutingDefaults()),
      dht: kadDHT({
        validators: {
          ipns: ipnsValidator
        },
        selectors: {
          ipns: ipnsSelector
        }
      }),
      identify: identify({
        agentVersion
      }),
      identifyPush: identifyPush({
        agentVersion
      }),
      keychain: keychain(),
      ping: ping(),
      relay: circuitRelayServer(),
      upnp: uPnPNAT(),
      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true })
    }
  }
})

const ipns = createIPNS(helia)

const fs = unixfs(helia)

const dnsLink = await ipns.resolveDNSLink('hypha.coop')

console.log({ dnsLink })

for await (const entry of fs.ls(dnsLink.cid)) {
  console.log(entry.path)
}

const cid = await fs.addDirectory('./example')

console.log('dir CID', cid)

for await (const entry of fs.ls(cid)) {
  console.log(entry.path)
}

// create a keypair to publish an IPNS name
const keypair = await generateKeyPair('Ed25519')

console.log('Publishing', keypair)

// publish the name
const record = await ipns.publish(keypair, cid, {
  signal: AbortSignal.timeout(5000)
})

console.log('Published', record)

const resolved = await ipns.resolve(keypair.publicKey)

console.log({ resolved })

await helia.stop()
