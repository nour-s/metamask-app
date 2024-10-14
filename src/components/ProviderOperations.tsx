import { ethers, Filter, FilterByBlockHash, TransactionResponse } from "ethers"

type Account = {
    id: string
    name: string
    balance: number,
    transactions: (TransactionResponse | null)[]
}

// This is method is special to my case where I tried to find the block number of a transaction where I transferred some ETH from one account to another
async function getReferenceBlock(provider: ethers.BrowserProvider) {
    const tx = await provider.getTransaction("0x447f0fc221a0c8403421210db75a3852bd5cda1290fadbd1a5fcb302b93f37d1")
    if (!tx) {
        console.error('Transaction not found')
    }
    const blockNumber = tx?.blockNumber || 0
    const block = await provider.getBlock(blockNumber) || { number: 0 }
    console.log('block:', block)
    return block
}

async function getTransactions(providerWithInfo: EIP6963ProviderDetail, account: Account) {
    const provider = new ethers.BrowserProvider(providerWithInfo.provider)

    // Get the latest block number
    const latestBlock = await provider.getBlockNumber()
    console.log('Latest block number:', latestBlock)


    const block = await getReferenceBlock(provider)

    // Get all transactions for the user's address
    const filter: Filter | FilterByBlockHash = {
        fromBlock: block.number - 1000, // Math.max(0, latestBlock - 10000),
        toBlock: block.number,
        topics: [
            ethers.id("Transfer(address,address,uint256)"),
            [
                ethers.zeroPadValue(account.id, 32),
                ethers.ZeroHash
            ]
        ]
    }

    // Get the logs that match the filter
    const logs = await provider.getLogs(filter)
    console.log('logs:', logs)

    // For each log, get the transaction associated with it
    const transactionsOfAccount = await Promise.all(
        logs.map(async (log) => await provider.getTransaction(log.transactionHash))
    )
    return transactionsOfAccount
}

async function getBalance(accId: string, providerWithInfo: EIP6963ProviderDetail) {
    const provider = new ethers.BrowserProvider(providerWithInfo.provider)
    const result = await provider.getBalance(accId)
    return ethers.formatEther(result)
}

const sendTransaction = async (from: string, to: string, amount: string, selectedWallet: EIP6963ProviderDetail) => {
    try {
        const provider = new ethers.BrowserProvider(selectedWallet.provider);
        const signer = await provider.getSigner(from);
        const tx = await signer.sendTransaction({
            to,
            value: ethers.parseEther(amount),
        });
        await tx.wait();
        // Optionally update account balances and transaction history here
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
};

// switch to the Linea Sepolia network in MetaMask
async function switchToLineaSepoliaNetwork(providerDetail: EIP6963ProviderDetail) {
    // Check if we're on the Linea Sepolia network
    const chainId = await providerDetail.provider.request({ method: 'eth_chainId' });
    if (chainId !== '0xe705') { // Linea Sepolia chainId
        try {
            await providerDetail.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xe705' }],
            })
        }
        catch (error) {
            console.error(error)
        };
    }
}

export { getTransactions, getBalance, sendTransaction, switchToLineaSepoliaNetwork }
export type { Account }

