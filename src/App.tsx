import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to Dashboard, {user?.name}</h1>
      <p className="mb-4">Role: {user?.role}</p>
      <button onClick={logout} className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors">
        Logout
      </button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/role-selection" 
            element={
              <PrivateRoute>
                <RoleSelection />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPlaceholder />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
