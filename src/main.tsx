import { Amplify } from 'aws-amplify'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// アプリケーション起動時に一度だけ実行
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_ENDPOINT,
      region: import.meta.env.VITE_APPSYNC_REGION,
      defaultAuthMode: 'apiKey',
      apiKey: import.meta.env.VITE_APPSYNC_API_KEY
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
