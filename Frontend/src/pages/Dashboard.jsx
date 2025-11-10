import React, { useState } from 'react'
import { pay, redeem, profile } from '../api'

function Dashboard({ user, onUpdateUser, showNotification }) {
  const [paymentAmount, setPaymentAmount] = useState('')
  const [redeemPoints, setRedeemPoints] = useState('')
  const [redeemReward, setRedeemReward] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!paymentAmount || paymentAmount <= 0) {
      showNotification('Please enter a valid amount', 'error')
      return
    }

    setLoading(true)
    try {
      const result = await pay({ amount: parseFloat(paymentAmount), description: `Payment of $${paymentAmount}` })
      const updatedUser = await profile()
      onUpdateUser(updatedUser)
      setPaymentAmount('')
      showNotification(result.message, 'success')
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (e) => {
    e.preventDefault()
    if (!redeemPoints || redeemPoints <= 0) {
      showNotification('Please enter valid points', 'error')
      return
    }

    if (parseInt(redeemPoints) > user.points) {
      showNotification('Not enough points', 'error')
      return
    }

    setLoading(true)
    try {
      const result = await redeem({ points: parseInt(redeemPoints), reward: redeemReward || 'Reward' })
      const updatedUser = await profile()
      onUpdateUser(updatedUser)
      setRedeemPoints('')
      setRedeemReward('')
      showNotification(result.message, 'success')
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="points-display">
          <div className="text-4xl font-bold">{user?.points || 0}</div>
          <div className="text-blue-100 text-lg">Total Points</div>
          <div className="text-blue-200 text-sm mt-2 capitalize">{user?.tier || 'bronze'} Tier</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <i className="fas fa-medal text-4xl mb-3 tier-gold"></i>
          <div className="text-xl font-semibold">Loyalty Program</div>
          <div className="text-gray-600 mt-2">Earn points with every payment</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <i className="fas fa-recycle text-4xl mb-3 text-green-500"></i>
          <div className="text-xl font-semibold">Eco Impact</div>
          <div className="text-gray-600 mt-2">Making recycling rewarding</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Make Payment */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-credit-card text-blue-500"></i>
            Make Payment
          </h3>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                disabled={loading}
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
                  <i className="fas fa-bolt"></i>
                  Process Payment
                </>
              )}
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <p>💡 You'll earn 1 point for every $10 spent</p>
            <p>✨ Tier bonuses apply automatically</p>
          </div>
        </div>

        {/* Redeem Points */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-gift text-green-500"></i>
            Redeem Points
          </h3>
          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points to Redeem
              </label>
              <input
                type="number"
                className="input"
                placeholder="Enter points"
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Description
              </label>
              <input
                type="text"
                className="input"
                placeholder="What would you like to redeem?"
                value={redeemReward}
                onChange={(e) => setRedeemReward(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-success w-full justify-center"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <i className="fas fa-gift"></i>
                  Redeem Points
                </>
              )}
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <p>🎁 Redeem points for rewards and discounts</p>
            <p>💰 Current balance: {user?.points || 0} points</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors">
            <i className="fas fa-history text-2xl text-blue-500 mb-2"></i>
            <div className="font-medium">History</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors">
            <i className="fas fa-chart-line text-2xl text-green-500 mb-2"></i>
            <div className="font-medium">Analytics</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors">
            <i className="fas fa-qrcode text-2xl text-purple-500 mb-2"></i>
            <div className="font-medium">Scan Code</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors">
            <i className="fas fa-share text-2xl text-orange-500 mb-2"></i>
            <div className="font-medium">Refer Friend</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard