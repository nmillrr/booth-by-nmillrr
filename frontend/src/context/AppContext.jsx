import React, { createContext, useContext, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Create context
const AppContext = createContext();

/**
 * App context provider for global state management
 */
export const AppProvider = ({ children }) => {
  // Define application-wide state
  const [recentImages, setRecentImages] = useLocalStorage('recentImages', []);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications([...notifications, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(current => current.filter(n => n.id !== id));
    }, 5000);
  };

  // Add an image to recent images
  const addRecentImage = (image) => {
    // Keep only the most recent 10 images
    setRecentImages(current => {
      const updated = [image, ...current];
      return updated.slice(0, 10);
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  // Value to be provided
  const value = {
    recentImages,
    theme,
    notifications,
    addNotification,
    addRecentImage,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook to use the app context
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;