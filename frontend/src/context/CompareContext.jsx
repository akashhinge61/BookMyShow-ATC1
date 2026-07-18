import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);
  const { addToast } = useToast();

  const addToCompare = (event) => {
    // Check if already in list
    if (compareList.some(item => item.id === event.id)) {
      addToast('Event is already added to Compare Corner', 'info');
      return;
    }

    // Limit to 3 items
    if (compareList.length >= 3) {
      addToast('You can compare a maximum of 3 events at a time', 'error');
      return;
    }

    setCompareList(prev => [...prev, event]);
    addToast(`Added "${event.title}" to Compare Corner!`, 'success');
  };

  const removeFromCompare = (eventId) => {
    const item = compareList.find(i => i.id === eventId);
    setCompareList(prev => prev.filter(item => item.id !== eventId));
    if (item) {
      addToast(`Removed "${item.title}" from Compare Corner`, 'info');
    }
  };

  const clearCompare = () => {
    setCompareList([]);
    addToast('Compare Corner cleared', 'info');
  };

  const isComparing = (eventId) => {
    return compareList.some(item => item.id === eventId);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isComparing }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
