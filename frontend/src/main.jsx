import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Set global Axios Base URL for deployments (e.g. Render backend)
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://bookmyshow-atc1.onrender.com';
import { PreferencesProvider } from './context/PreferencesContext';
import { CompareProvider } from './context/CompareContext';
import { BookingProvider } from './context/BookingContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <PreferencesProvider>
            <CompareProvider>
              <BookingProvider>
                <App />
              </BookingProvider>
            </CompareProvider>
          </PreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  </React.StrictMode>
);
