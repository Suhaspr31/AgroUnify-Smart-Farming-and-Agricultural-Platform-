import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const toggleSidebar = () => setSidebar(!sidebar);
  const openSidebar = () => setSidebar(true);
  const closeSidebar = () => setSidebar(false);

  const value = {
    notification,
    showNotification,
    hideNotification,
    loading,
    showLoading,
    hideLoading,
    sidebar,
    toggleSidebar,
    openSidebar,
    closeSidebar
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
