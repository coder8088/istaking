import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import {WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {lightTheme, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {config} from "./config";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <WagmiProvider config={config}>
          <QueryClientProvider client={new QueryClient()}>
              <RainbowKitProvider appInfo={{
                  appName: "iStaking"
              }} coolMode showRecentTransactions={true} theme={{
                  lightMode: lightTheme(),
                  darkMode: lightTheme(),
              }} modalSize="compact">
                  <App />
              </RainbowKitProvider>
          </QueryClientProvider>
      </WagmiProvider>
  </StrictMode>,
)
