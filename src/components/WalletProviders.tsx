import { useState } from 'react'
import { useSyncProviders } from '../hooks/useSyncProviders'
import TransactionsHistory from './TransactionsHistory'
import SendETHModal from './SendETHModal'
import { Account, connectToMobileWallet, getBalance, getTransactions, sendTransaction, switchToLineaSepoliaNetwork } from './ProviderOperations'

export const DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map())
  const [isOpen, setIsOpen] = useState(false);

  const providers = useSyncProviders()

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    const accountIds: string[] =
      await (
        providerWithInfo.provider
          .request({ method: 'eth_requestAccounts' })
          .catch(console.error)
      ) as string[];

    if (!accounts) {
      throw new Error('No accounts found')
    }
    setSelectedWallet(providerWithInfo)

    await initializeAccounts(accountIds, providerWithInfo)
  }

  const handleConnectToMobileWallet = async () => {
    const inMobileDevice = window.navigator.maxTouchPoints > 2;
    if (!inMobileDevice) {
      alert('This button works on mobile devices only')
      return
    }
    const [accountIds, provider] = await connectToMobileWallet()
    setSelectedWallet(provider)
    await initializeAccounts(accountIds, provider)
  }

  async function initializeAccounts(accountIds: string[], providerWithInfo: EIP6963ProviderDetail) {
    accountIds?.forEach((id: string) => {
      setAccounts(accounts.set(id, {
        id: id,
        name: id,
        balance: 0,
        transactions: [],
      }));
    });

    await switchToLineaSepoliaNetwork(providerWithInfo)

    providerWithInfo.provider.on("chainChanged", handleChainChanged)

    function handleChainChanged() {
      // We recommend reloading the page, unless you must do otherwise.
      window.location.reload()
    }

    // Create an ethers provider using the MetaMask provider
    await Promise.all(Array.from(accounts.values()).map(async (acc) => {
      console.log('Loading transactions for account:', acc)
      const transactionsOfAccount = await getTransactions(providerWithInfo, acc)
      const account = accounts.get(acc.id)
      if (account != null) {
        account.transactions = transactionsOfAccount
        account.transactions = transactionsOfAccount
      }
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

  const handleSendETHDialogSubmit = async (from: string, to: string, amount: string) => {
    await sendTransaction(from, to, amount, selectedWallet)
  }

  return (
    <>
      <button onClick={handleConnectToMobileWallet}>Connect to mobile</button>
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
            <img src={selectedWallet.info?.icon} alt={selectedWallet.info?.name} style={{ marginRight: "10px" }} />
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{selectedWallet.info?.name}</div>
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
      <SendETHModal isOpen={isOpen} setIsOpen={setIsOpen} handleSendTransaction={handleSendETHDialogSubmit} accounts={accounts} onClose={() => setIsOpen(false)} />
      {selectedWallet && <div>
        <button onClick={() => setIsOpen(true)}>Send ETH</button>
      </div>}
    </>
  )
}
