import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state in localStorage
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial state value
 * @returns {Array} - [storedValue, setValue]
 */
const useLocalStorage = (key, initialValue) => {
  // Get from localStorage on initial render
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Update localStorage when the state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;