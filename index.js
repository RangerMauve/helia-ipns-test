import { unixfs as createUnixFS } from '@helia/unixfs'
import { ipns as createIPNS } from '@helia/ipns'
import { createHelia } from 'helia'

const helia = await createHelia({
    libp2p: {
        start: false
    }
})

const ipns = createIPNS(helia)

const unixfs = createUnixFS(helia)

/*
const resolved = await ipns.resolve('k51qzi5uqu5dlmj8c05a6xk0g0n09x2m3a76lq3ahemgwtsr8s0r4lax9f5yvp')

console.log(resolved)
*/

const dnsLink = await ipns.resolveDNSLink('hypha.coop')

console.log({dnsLink})