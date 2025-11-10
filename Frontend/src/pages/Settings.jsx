import React, { useState, useEffect } from 'react'
import { updateBg } from '../api'

function Settings({ user, onUpdate, showNotification }) {
  const [bgColor, setBgColor] = useState(user?.bg_color || '#ffffff')
  const [loading, setLoading] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState(null)
  const [activeTab, setActiveTab] = useState('account')

  const presetColors = [
    { name: 'Default', value: '#ffffff' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Green', value: '#dcfce7' },
    { name: 'Purple', value: '#f3e8ff' },
    { name: 'Orange', value: '#ffedd5' },
    { name: 'Pink', value: '#fce7f3' }
  ]

  useEffect(() => {
    fetchNotificationPreferences()
  }, [])

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/notifications/preferences', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      })
      if (response.ok) {
        const prefs = await response.json()
        setNotificationPrefs(prefs)
      } else {
        // Set default preferences if API not available
        setNotificationPrefs({
          sms_notifications: true,
          email_notifications: true,
          reminder_frequency: 'weekly',
          payment_reminders: true,
          promotional_offers: true
        })
      }
    } catch (err) {
      // Set default preferences on error
      setNotificationPrefs({
        sms_notifications: true,
        email_notifications: true,
        reminder_frequency: 'weekly',
        payment_reminders: true,
        promotional_offers: true
      })
    }
  }

  const updateNotificationPreferences = async (updates) => {
    const newPrefs = { ...notificationPrefs, ...updates }
    setNotificationPrefs(newPrefs)
    
    try {
      const response = await fetch('http://localhost:4000/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(newPrefs)
      })
      
      if (response.ok) {
        showNotification('Notification preferences updated!', 'success')
      } else {
        showNotification('Failed to update preferences', 'error')
      }
    } catch (err) {
      showNotification('Failed to update preferences', 'error')
    }
  }

  const testPaymentReminder = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/notifications/payment-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ days_until_due: 3 })
      })
      
      if (response.ok) {
        showNotification('Test payment reminder sent! Check console for SMS/email simulation.', 'success')
      } else {
        showNotification('Failed to send test reminder', 'error')
      }
    } catch (err) {
      showNotification('Failed to send test reminder', 'error')
    }
  }

  const handleBgUpdate = async (color) => {
    setLoading(true)
    try {
      await updateBg(color)
      const updatedUser = { ...user, bg_color: color }
      onUpdate(updatedUser)
      setBgColor(color)
      showNotification('Background updated successfully!', 'success')
    } catch (err) {
      showNotification('Failed to update background', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account and notification preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('account')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'account'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-user mr-2"></i>
          Account
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'notifications'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-bell mr-2"></i>
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'theme'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="fas fa-palette mr-2"></i>
          Theme
        </button>
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-user-circle text-blue-500"></i>
            Account Information
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Name</div>
                <div className="text-gray-600">{user?.name || 'Not provided'}</div>
              </div>
              <button className="btn btn-secondary text-sm">
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Phone</div>
                <div className="text-gray-600">{user?.phone}</div>
              </div>
              <button className="btn btn-secondary text-sm">
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Email</div>
                <div className="text-gray-600">{user?.email || 'Not provided'}</div>
              </div>
              <button className="btn btn-secondary text-sm">
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>

            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Member Since</div>
                <div className="text-gray-600">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Loyalty Tier</div>
                <div className="text-gray-600 capitalize">{user?.tier || 'bronze'}</div>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Total Points</div>
                <div className="text-gray-600">{user?.points || 0} points</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && notificationPrefs && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-bell text-blue-500"></i>
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">SMS Notifications</div>
                  <div className="text-gray-600 text-sm">Receive payment reminders via SMS</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.sms_notifications}
                    onChange={(e) => updateNotificationPreferences({ sms_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-gray-600 text-sm">Receive payment reminders via email</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.email_notifications}
                    onChange={(e) => updateNotificationPreferences({ email_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Payment Reminders</div>
                  <div className="text-gray-600 text-sm">Get reminded about upcoming payments</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.payment_reminders}
                    onChange={(e) => updateNotificationPreferences({ payment_reminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="p-3 border border-gray-100 rounded-lg">
                <label className="block font-medium text-gray-900 mb-2">
                  Reminder Frequency
                </label>
                <select
                  value={notificationPrefs.reminder_frequency}
                  onChange={(e) => updateNotificationPreferences({ reminder_frequency: e.target.value })}
                  className="input"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Test Notification Button */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Test Notifications</h4>
              <p className="text-blue-700 text-sm mb-3">
                Send a test payment reminder to see how notifications will look. Check your backend console for the simulated SMS/email.
              </p>
              <button
                onClick={testPaymentReminder}
                className="btn btn-primary"
              >
                <i className="fas fa-paper-plane"></i>
                Send Test Reminder
              </button>
            </div>
          </div>

          {/* Notification History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recent Notifications</h3>
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-bell-slash text-3xl mb-3"></i>
              <p>No notifications yet</p>
              <p className="text-sm mt-2">Your payment reminders will appear here</p>
            </div>
          </div>
        </div>
      )}

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-palette text-purple-500"></i>
            Theme Customization
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Background Color
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleBgUpdate(color.value)}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    bgColor === color.value 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {loading && bgColor === color.value && (
                    <div className="loading-spinner mx-auto"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom color:
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="input flex-1"
                placeholder="#ffffff"
              />
              <button
                onClick={() => handleBgUpdate(bgColor)}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
          <i className="fas fa-shield-alt"></i>
          Security
        </h3>
        
        <div className="space-y-3">
          <button className="w-full text-left p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">Change Password</div>
            <div className="text-gray-600 text-sm">Update your account password</div>
          </button>

          <button className="w-full text-left p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="font-medium text-gray-900">Two-Factor Authentication</div>
            <div className="text-gray-600 text-sm">Add an extra layer of security</div>
          </button>

          <button className="w-full text-left p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors text-red-600">
            <div className="font-medium">Delete Account</div>
            <div className="text-sm">Permanently remove your account and data</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings