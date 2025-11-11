import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
//import * as Sentry from "@sentry/react";


//caching data with react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
//import GlobalLoggerProvider from './utils/GlobalLoggerProvider.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // les données restent fraîches 5 minutes 
      gcTime: 30 * 60 * 1000, // 30 minute gardées en mémoire même si inutilisées
      refetchOnReconnect: false, // Pas de refetch auto quand le réseau revient
    },
  },
}); 




createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>

    
  </StrictMode>,
)
