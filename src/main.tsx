import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MetaMaskProvider } from "@metamask/sdk-react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MetaMaskProvider
      debug={true}
      sdkOptions={{
        dappMetadata: {
          name: "MetaMask POC",
          url: window.location.href,
        },
        infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY,
      }}>
      <App />
    </MetaMaskProvider>
  </StrictMode >
)
