import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

import { initAutoTheme } from './design/theme';
import { AuthProvider } from './context/AuthProvider'
import NotificationsProvider from './context/NotificationProvider'

initAutoTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>
)
