# Connect to Wallet Example

This is an example app that demonstrates how to connect to a wallet using EIP6963. It detects all the wallets extensions installed in the browser and allows the user to connect to one of them.

When selecting a wallet, the app will display all the accounts available in the wallet. It uses ethers 6 to interact with the wallet. It can get the account id, balance, and transactions list.
If Linea Sepolia chain is not selected, it will ask the wallet provider to switch to it, if the chain doesn't exists it will ask the wallet to add it prompting the user to approve.

At the bottom there is Send ETH that shows a form to send ETH to another account. It uses the wallet to sign the transaction and send it to the network.

The Connect To Mobile Wallet button works only when the app is running in a mobile browser. It will open the wallet app installed in the device to connect to the app. Once connected, the app will display the account id, balance, and transactions list same as the browser verion.

![image](https://github.com/user-attachments/assets/cd6caf23-a406-42f7-8b20-a2783192d646)


## Prerequisites

- Node.js (>= 14.x)
- Yarn 2 (Berry)

## Getting Started

### Installation

1. **Clone the repository:**

    ```sh
    git clone <repository-url>
    cd metamask-app
    ```

2. **Install dependencies:**

    ```sh
    yarn install
    ```

### Running the App

To start the development server, run:

```sh
yarn dev
```

This will start the Vite development server and you can view the app in your browser at http://localhost:5173 (double check the console output for the actual port).
