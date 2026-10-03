import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store'
import { ToastProvider } from './Toast/ToastProvider.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ToastProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ToastProvider>
  </Provider>
)

