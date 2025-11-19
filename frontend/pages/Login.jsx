import React, { useState } from 'react'
import { login } from '../api'

function Login({ onLogin, showNotification }) {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { token, user, message } = await login(form)
      onLogin(user, token, message)
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your EcoRewards account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-phone mr-2"></i>
            Phone Number
          </label>
          <input
            type="tel"
            required
            className="input"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-lock mr-2"></i>
            Password
          </label>
          <input
            type="password"
            required
            className="input"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full justify-center"
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login