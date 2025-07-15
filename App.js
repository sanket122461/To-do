import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import KanbanBoard from './components/KanbanBoard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return (
      <div className="auth-wrapper">
        {showRegister
          ? <RegisterForm onRegister={() => setShowRegister(false)} />
          : <LoginForm onLogin={setUser} />}
        <button onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? 'Back to Login' : 'Register'}
        </button>
      </div>
    );
  }

  return <KanbanBoard user={user} />;
}

export default App;
