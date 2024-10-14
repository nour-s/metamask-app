import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import { ethers, Filter, FilterByBlockHash, TransactionResponse } from 'ethers'
import TransactionsHistory from './TransactionsHistory'

type Account = {
  id: string
  name: string
  balance: number,
  transactions: TransactionResponse[]
}

async function loadTransactions(providerWithInfo: EIP6963ProviderDetail, account: Account) {
  const provider = new ethers.BrowserProvider(providerWithInfo.provider)

  // Get the latest block number
  const latestBlock = await provider.getBlockNumber()
  console.log('Latest block number:', latestBlock)


  const tx = await provider.getTransaction("0x447f0fc221a0c8403421210db75a3852bd5cda1290fadbd1a5fcb302b93f37d1")
  const block = await provider.getBlock(tx.blockNumber)
  console.log('block:', block)

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

  const logs = await provider.getLogs(filter)
  console.log('logs:', logs)

  // Process and format the transaction data
  const transactionsOfAccount = await Promise.all(
    logs.map(async (log) => await provider.getTransaction(log.transactionHash))
  )
  return transactionsOfAccount
}

export const DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map())
  const providers = useSyncProviders()

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    const accountIds: string[] | undefined =
      await (
        providerWithInfo.provider
          .request({ method: 'eth_requestAccounts' })
          .catch(console.error)
      ) as string[] | undefined;

    if (!accounts) {
      throw new Error('No accounts found')
    }
    setSelectedWallet(providerWithInfo)

    accountIds?.forEach((id: string) => {
      setAccounts(accounts.set(id, {
        id: id,
        name: id,
        balance: 0,
        transactions: [],
      }));
    });

    // Check if we're on the Linea Sampolia network
    const chainId = await providerWithInfo.provider.request({ method: 'eth_chainId' });
    if (chainId !== '0xe705') { // Linea Sampolia chainId
      throw new Error('Please switch to the Linea Sepolia network in MetaMask');
    }

    // Create an ethers provider using the MetaMask provider
    await Promise.all(Array.from(accounts.values()).map(async (acc) => {
      console.log('Loading transactions for account:', acc)
      const transactionsOfAccount = await loadTransactions(providerWithInfo, acc)
      accounts.get(acc.id).transactions = transactionsOfAccount
    }))

    console.log('Done filling in transactions')
    setAccounts(new Map(accounts));
  }



  return (
    <>
      <h2>Wallets Detected:</h2>
      <div>
        {
          providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
            <button key={provider.info.uuid} onClick={() => handleConnect(provider)} >
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
          )) :
            <div>
              No Announced Wallet Providers
            </div>
        }
      </div>
      <hr />
      <h2>{accounts ? "" : "No "}Wallet Selected</h2>
      {selectedWallet &&
        <div>
          <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", display: "flex", alignItems: "center" }}>
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} style={{ marginRight: "10px" }} />
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{selectedWallet.info.name}</div>
          </div>
        </div>
      }
      <hr />
      <h2 >Accounts:</h2 >
      <div>
        {
          Array.from(accounts.keys()).map((id) =>
            <div key={id}>
              <h3>Account: {id}</h3>
              <h4>Balance: {accounts.get(id)?.balance}</h4>

              <div >
                <h2>Transaction History:</h2>
                <TransactionsHistory transactions={accounts.get(id)?.transactions} />
              </div >
            </div>
          )
        }
      </div>
    </>
  )
}
