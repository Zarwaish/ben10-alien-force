import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#0a1a0a',
          color: '#00ff00',
          border: '1px solid #00ff00',
        },
      }} />
    </AuthProvider>
  </React.StrictMode>,
)

