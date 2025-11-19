import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Loyalty from './pages/Loyalty'

function App() {
  const [route, setRoute] = useState('login');
  const [user, setUser] = useState(null);
  const [bg, setBg] = useState('#f8fafc');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (token && u) {
      try {
        const parsed = JSON.parse(u);
        setUser(parsed);
        setBg(parsed.bg_color || '#f8fafc');
        setRoute('dashboard');
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => { 
    document.body.style.background = bg;
    document.body.style.transition = 'background 0.5s ease';
  }, [bg]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRoute('login');
    showNotification('Logged out successfully', 'success');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-300">
      {/* Notification System */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fas ${
              notification.type === 'success' ? 'fa-check-circle' :
              notification.type === 'error' ? 'fa-exclamation-circle' :
              'fa-info-circle'
            }`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl glass-effect rounded-3xl shadow-2xl p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i className="fas fa-recycle text-white"></i>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EcoRewards
            </h1>
          </div>
          
          <nav className="flex gap-2">
            {!user && (
              <>
                <button onClick={() => setRoute('login')} className="btn btn-secondary">
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </button>
                <button onClick={() => setRoute('register')} className="btn btn-primary">
                  <i className="fas fa-user-plus"></i>
                  Register
                </button>
              </>
            )}
            {user && (
              <>
                <button onClick={() => setRoute('dashboard')} className="btn btn-secondary">
                  <i className="fas fa-home"></i>
                  Dashboard
                </button>
                <button onClick={() => setRoute('loyalty')} className="btn btn-secondary">
                  <i className="fas fa-medal"></i>
                  Loyalty
                </button>
                <button onClick={() => setRoute('settings')} className="btn btn-secondary">
                  <i className="fas fa-cog"></i>
                  Settings
                </button>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </>
            )}
          </nav>
        </header>

        <main className="fade-in">
          {route === 'login' && <Login onLogin={(u, token, message) => { 
            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#f8fafc'); 
            setRoute('dashboard');
            showNotification(message || 'Login successful!', 'success');
          }} showNotification={showNotification} />}
          
          {route === 'register' && <Register onRegister={(u, token, message) => { 
            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#f8fafc'); 
            setRoute('dashboard');
            showNotification(message || 'Registration successful!', 'success');
          }} showNotification={showNotification} />}
          
          {route === 'dashboard' && <Dashboard user={user} onUpdateUser={(u) => { 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#f8fafc');
          }} showNotification={showNotification} />}
          
          {route === 'loyalty' && <Loyalty user={user} showNotification={showNotification} />}
          
          {route === 'settings' && <Settings user={user} onUpdate={(u) => { 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#f8fafc'); 
            setRoute('dashboard');
            showNotification('Settings updated successfully!', 'success');
          }} showNotification={showNotification} />}
        </main>

        <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-600">
          <p>♻️ Smart Waste Platform - Making recycling rewarding</p>
        </footer>
      </div>
    </div>
  )
}

export default App