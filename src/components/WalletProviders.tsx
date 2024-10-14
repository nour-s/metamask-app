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
  if (!tx) {
    console.error('Transaction not found')
  }
  const block = await provider.getBlock(tx?.blockNumber) || { number: 0 }
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

async function getBalance(accId: string, providerWithInfo: EIP6963ProviderDetail) {
  const provider = new ethers.BrowserProvider(providerWithInfo.provider)
  const result = await provider.getBalance(accId)
  return ethers.formatEther(result)
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

    // fill in the balances
    await Promise.all(Array.from(accounts.values()).map(async (acc) => {
      const balance = await getBalance(acc.id, providerWithInfo)
      const account = accounts.get(acc.id);
      if (account) {
        account.balance = parseFloat(balance);
      }
    }));

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
            <div key={id} style={{ backgroundColor: "#333", color: "#fff", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
              <div style={{ borderBottom: "1px solid #555", paddingBottom: "5px" }}>
                <h3>Id: {id}</h3>
                <h4>Balance: {accounts.get(id)?.balance} ETH</h4>
              </div>
              <div style={{ marginTop: "10px" }}>
                <h4>Transaction History:</h4>
                <TransactionsHistory transactions={accounts.get(id)?.transactions} />
              </div>
            </div>
          )
        }
      </div>
    </>
  )
}
