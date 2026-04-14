import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(230, 17%, 13%)',
            color: 'hsl(230, 15%, 95%)',
            border: '1px solid hsl(230, 15%, 25%)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: 'hsl(142, 69%, 48%)', secondary: 'white' }
          },
          error: {
            iconTheme: { primary: 'hsl(350, 80%, 58%)', secondary: 'white' }
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
