import React, { useState } from 'react'
import { register } from '../api'

function Register({ onRegister, showNotification }) {
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (form.password !== form.confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return
    }

    if (form.password.length < 6) {
      showNotification('Password must be at least 6 characters', 'error')
      return
    }

    setLoading(true)
    
    try {
      const { token, user, message } = await register(form)
      onRegister(user, token, message)
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join EcoRewards and start earning points</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-user mr-2"></i>
            Full Name
          </label>
          <input
            type="text"
            className="input"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-phone mr-2"></i>
            Phone Number *
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
            <i className="fas fa-envelope mr-2"></i>
            Email Address
          </label>
          <input
            type="email"
            className="input"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-lock mr-2"></i>
            Password *
          </label>
          <input
            type="password"
            required
            className="input"
            placeholder="Enter your password (min 6 characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <i className="fas fa-lock mr-2"></i>
            Confirm Password *
          </label>
          <input
            type="password"
            required
            className="input"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full justify-center mt-4"
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              Create Account
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register