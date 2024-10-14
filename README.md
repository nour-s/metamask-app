# Connect to Wallet Example

This is an example app that demonstrates how to connect to a wallet using EIP6963. It detects all the wallets extensions installed in the browser and allows the user to connect to one of them.

When selecting a wallet, the app will display all the accounts available in the wallet. It uses ethers 6 to interact with the wallet. It can get the account id, balance, and transactions list.
If Linea Sepolia chain is not selected, it will ask the wallet provider to switch to it, if the chain doesn't exists it will ask the wallet to add it prompting the user to approve.

At the bottom there is Send ETH that shows a form to send ETH to another account. It uses the wallet to sign the transaction and send it to the network.

The Connect To Mobile Wallet button works only when the app is running in a mobile browser. It will open the wallet app installed in the device to connect to the app. Once connected, the app will display the account id, balance, and transactions list same as the browser verion.

<img src="https://github.com/user-attachments/assets/cd6caf23-a406-42f7-8b20-a2783192d646" width="700" />


## Prerequisites

- Node.js (>= 14.x)
- Yarn 2 (Berry)

## Getting Started

### Installation

1. **Clone the repository:**

    ```sh
    git clone git@github.com/nour-s/metamask-app/
    cd metamask-app
    ```
    notice I'm using Github over ssh, you can use https://github.com/nour-s/metamask-app url instead for cloning using http.

2. **Install dependencies:**

    ```sh
    yarn install
    ```

### Running the App

To start the development server, run:

```sh
yarn dev
```

<img src="https://github.com/user-attachments/assets/8b2bd673-e1e7-479f-ba04-978d9d28ce3f" width="500" />


This will start the Vite development server and you can view the app in your browser at http://localhost:5173 (double check the console output for the actual port).

### Running the App on mobile browser
you can simply either connect the phone to the same network, run yarn with the --host option and open the browser on the phone and navigate to the ip address of the computer running the app.

```sh
yarn dev --host
```
<img src="https://github.com/user-attachments/assets/f6ad2121-52d3-4193-a946-24aba7fb0705" width="500" />

or you can use ngrok to tunnel the local server to the internet and open the link on the phone.

```sh
# if you have domain setup
ngrok http --domain=domain-offered-by-ngrok.ngrok-free.app 5173

# or using dynamic url
ngrok http 5173
```

### Debugging the App on Mobile

For debugging the web app on the phone, I used the remote debugging feature of Chrome (check the [documentation](https://developer.chrome.com/docs/devtools/remote-debugging) for more information) which allows you to use same DevTools features from your computer to inspect the web app running on the phone (pretty cool to be honest 🙃)
