import { mainnet, sepolia } from 'wagmi/chains'

type ChainInfo = {
  id: number
  name: string
  network: string
}

const chains: ChainInfo[] = [
  {
    id: mainnet.id,
    name: 'Ethereum',
    network: 'mainnet'
  },
  {
    id: sepolia.id,
    name: 'Sepolia',
    network: 'testnet'
  }
]

export function getChainInfo(chainId: number): ChainInfo | undefined {
  return chains.find(chain => chain.id === chainId)
} 