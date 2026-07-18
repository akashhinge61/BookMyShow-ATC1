import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { CompareProvider } from './context/CompareContext';
import { BookingProvider } from './context/BookingContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <PreferencesProvider>
          <CompareProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </CompareProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);
