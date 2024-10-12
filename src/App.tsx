import { useState } from 'react';
import './App.css';
import { useSDK } from "@metamask/sdk-react";

type Account = {
  name: string
  balance: number,
  transactions: object[]
}

export const App = () => {
  const [accounts, setAccounts] = useState<Map<string, Account>>(new Map());
  const { sdk, connected, connecting, provider, chainId } = useSDK();

  const connect = async () => {
    try {
      const accountIds = await sdk?.connect();

      accountIds?.forEach((acc: string) => {
        setAccounts(accounts.set(acc, {
          name: acc,
          balance: 0,
          transactions: [],
        }));
      });

      console.log("connected..", accountIds);

      // const x = await provider?.request({ method: 'eth_requestAccounts' })
      // console.log("eth_requestAccounts", x);

      // get balances of accounts
      await Promise.all(Array.from(accounts.keys()).map(async (accId: string) => {
        const result = await provider?.request<string>({ method: 'eth_getBalance', params: [accId, 'latest'] });
        let balance = 0;
        if (result) {
          balance = parseInt(result, 16) / 1e18;
        }
        const acc: Account = accounts.get(accId) || { name: accId, balance: 0, transactions: [] };
        if (acc) {
          acc.balance = balance;
        }
        accounts.set(accId, acc);
        setAccounts(new Map(accounts));
        console.log("updated balance..", { accId, balance });
      }));

    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  return (
    <div className="App">
      <button disabled={connecting} style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect
      </button>
      {connected && (
        <div>
          {chainId && `Connected chain: ${chainId}`}
          <p></p>
          {accounts &&
            <>
              {accounts != null && <p>{accounts.size}</p>}
              Connected account:
              {

                Array.from(accounts.values()).map((acc) => (
                  <div key={acc.name} style={{
                    textAlign: 'left',
                    padding: '10px',
                    margin: '10px 0',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                      Name: {acc.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      Balance: {acc.balance}
                    </div>
                  </div>
                ))
              }
            </>
          }
        </div>
      )
      }
    </div >
  );
}

export default App;
