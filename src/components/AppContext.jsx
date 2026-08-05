import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Safe initial load from localStorage to prevent crashes
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch candidates centrally with Authorization header
  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/candidates', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      setError("Failed to load candidate pipeline.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync user state with localStorage
  const loginUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
  };

  const logoutUser = () => {
    setUser(null);
    setCandidates([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <AppContext.Provider 
      value={{ 
        user, 
        setUser, 
        loginUser,
        logoutUser,
        candidates, 
        setCandidates, 
        loading, 
        error,
        fetchCandidates 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);