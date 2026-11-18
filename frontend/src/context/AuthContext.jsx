import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (fullName, email, password, currency = 'INR') => {
    const data = await authService.register(fullName, email, password, currency);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (fullName, currency) => {
    const data = await authService.updateProfile(fullName, currency);
    setUser((prev) => ({
      ...prev,
      fullName: data.fullName,
      currency: data.currency,
    }));
    return data;
  };

  const getCurrencySymbol = (curr = null) => {
    const c = curr || (user && user.currency) || 'INR';
    return currencySymbols[c] || c;
  };

  const formatCurrency = (amount, curr = null) => {
    const num = Number(amount) || 0;
    const symbol = getCurrencySymbol(curr);
    return `${symbol} ${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        formatCurrency,
        getCurrencySymbol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
