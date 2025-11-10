import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Loyalty from './pages/Loyalty'

function App() {
  const [route, setRoute] = useState('login');
  const [user, setUser] = useState(null);
  const [bg, setBg] = useState('#ffffff');
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
        setBg(parsed.bg_color || '#ffffff');
        setRoute('dashboard');
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => { 
    document.body.style.background = bg;
    document.body.style.transition = 'background 0.3s ease';
  }, [bg]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRoute('login');
    showNotification('Logged out successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-recycle text-white text-sm"></i>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">EcoRewards</span>
            </div>
            
            <nav className="flex space-x-4">
              {!user ? (
                <>
                  <button 
                    onClick={() => setRoute('login')} 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      route === 'login' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setRoute('register')}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setRoute('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      route === 'dashboard' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setRoute('loyalty')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      route === 'loyalty' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Loyalty
                  </button>
                  <button 
                    onClick={() => setRoute('settings')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      route === 'settings' 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {route === 'login' && <Login onLogin={(u, token, message) => { 
            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#ffffff'); 
            setRoute('dashboard');
            showNotification(message || 'Login successful!', 'success');
          }} showNotification={showNotification} />}
          
          {route === 'register' && <Register onRegister={(u, token, message) => { 
            localStorage.setItem('token', token); 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#ffffff'); 
            setRoute('dashboard');
            showNotification(message || 'Registration successful!', 'success');
          }} showNotification={showNotification} />}
          
          {route === 'dashboard' && <Dashboard user={user} onUpdateUser={(u) => { 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#ffffff');
          }} showNotification={showNotification} />}
          
          {route === 'loyalty' && <Loyalty user={user} showNotification={showNotification} />}
          
          {route === 'settings' && <Settings user={user} onUpdate={(u) => { 
            localStorage.setItem('user', JSON.stringify(u)); 
            setUser(u); 
            setBg(u.bg_color || '#ffffff'); 
            setRoute('dashboard');
            showNotification('Settings updated successfully!', 'success');
          }} showNotification={showNotification} />}
        </div>
      </main>
    </div>
  )
}

export default App