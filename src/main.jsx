import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ThemeProvider from './context/ThemeProvider.jsx'
import NotificationProvider from './context/NotificationProvider.jsx'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ThemeProvider>
)