import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeUser() {
      try {
        let storedId = localStorage.getItem('bms_user_id');
        let email = localStorage.getItem('bms_user_email');
        let name = localStorage.getItem('bms_user_name');
        
        if (!storedId) {
          // Generate new Guest ID
          storedId = 'guest_' + Math.random().toString(36).substring(2, 15);
          name = 'Guest Explorer';
          email = null;
          
          localStorage.setItem('bms_user_id', storedId);
          localStorage.setItem('bms_user_name', name);
        }

        // Register user on backend
        const response = await axios.post('/api/user/setup', {
          userId: storedId,
          email: email,
          name: name
        });
        
        setUser(response.data);
      } catch (err) {
        console.error('Error initializing user session:', err.message);
      } finally {
        setLoading(false);
      }
    }

    initializeUser();
  }, []);

  const loginWithGoogle = async (googleUser) => {
    setLoading(true);
    try {
      const email = googleUser.email;
      const name = googleUser.name;
      const userId = googleUser.id || email.split('@')[0];

      const response = await axios.post('/api/user/setup', {
        userId,
        email,
        name
      });

      localStorage.setItem('bms_user_id', userId);
      localStorage.setItem('bms_user_email', email);
      localStorage.setItem('bms_user_name', name);

      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Google login failed:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bms_user_id');
    localStorage.removeItem('bms_user_email');
    localStorage.removeItem('bms_user_name');
    
    // Auto re-initialize as a new guest
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
