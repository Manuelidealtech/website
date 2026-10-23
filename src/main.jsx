import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './i18n/LanguageContext'
import { SiteContentProvider } from './context/SiteContentContext'
import './styles/base.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteContentProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </SiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)