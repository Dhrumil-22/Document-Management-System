import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import RegisterForm from './components/RegisterForm';  // ✅ registration form
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing system...</p>
        </div>
      </div>
    );
  }

  // ✅ If not logged in → show login or registration
  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitch={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitch={() => setShowRegister(true)} />
    );
  }

  // ✅ If logged in → show one common dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
