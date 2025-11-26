import React from 'react';
import './App.css';
import AppRoutes from './routes/AppRoutes';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
