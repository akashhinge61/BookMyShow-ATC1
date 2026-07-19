import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState({
    favorite_categories: ['movies', 'comedy'],
    preferred_languages: ['English', 'Hindi'],
    preferred_cities: ['Mumbai'],
    budget_preference: 1000.00,
    time_preference: 'evening'
  });
  const [preferredCity, setPreferredCity] = useState('Mumbai');
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axios.get('/api/user/preferences', {
        headers: { 'x-user-id': user.id }
      });
      setPreferences(res.data);
      
      // Sync preferredCity with the first city in list if exists
      const cities = res.data.preferred_cities || [];
      if (cities.length > 0) {
        setPreferredCity(cities[0]);
      }
    } catch (err) {
      console.error('Failed to load user preferences:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const savePreferences = async (updatedData) => {
    if (!user) return;
    try {
      const res = await axios.post('/api/user/preferences', updatedData, {
        headers: { 'x-user-id': user.id }
      });
      setPreferences(res.data);
      addToast('Preferences updated successfully!', 'success');
      
      // Auto sync city
      const cities = res.data.preferred_cities || [];
      if (cities.length > 0) {
        setPreferredCity(cities[0]);
      }
    } catch (err) {
      console.error('Failed to update preferences:', err.message);
      addToast('Failed to save preferences', 'error');
    }
  };

  const changeCity = async (city) => {
    setPreferredCity(city);
    if (!user) return;

    // Update city list on database preference
    const updatedCities = [city, ...preferences.preferred_cities.filter(c => c !== city)];
    await savePreferences({
      favoriteCategories: preferences.favorite_categories,
      preferredLanguages: preferences.preferred_languages,
      preferredCities: updatedCities,
      budgetPreference: preferences.budget_preference,
      timePreference: preferences.time_preference,
      additionalPreferences: preferences.additional_preferences || {}
    });
  };

  return (
    <PreferencesContext.Provider value={{ 
      preferences, 
      preferredCity, 
      loading, 
      savePreferences, 
      changeCity, 
      refreshPreferences: fetchPreferences 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
