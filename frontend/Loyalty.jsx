import React, { useState, useEffect } from 'react'
import { getLoyaltyInfo, profile } from '../api'

function Loyalty({ user, showNotification }) {
  const [loyaltyInfo, setLoyaltyInfo] = useState(null)
  const [userData, setUserData] = useState(user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [info, userProfile] = await Promise.all([
        getLoyaltyInfo(),
        profile()
      ])
      setLoyaltyInfo(info)
      setUserData(userProfile)
    } catch (err) {
      showNotification('Failed to load loyalty information', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'text-yellow-800 bg-yellow-100'
      case 'silver': return 'text-gray-600 bg-gray-100'
      case 'gold': return 'text-yellow-600 bg-yellow-50'
      case 'platinum': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Loading loyalty program...</span>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Program</h2>
        <p className="text-gray-600">Earn more as you recycle more!</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="points-display">
          <div className="text-2xl font-bold">{userData.points || 0}</div>
          <div className="text-blue-100">Total Points</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <i className="fas fa-medal text-3xl mb-3 tier-{userData.tier}"></i>
          <div className="text-lg font-semibold capitalize">{userData.tier || 'bronze'} Tier</div>
          <div className="text-sm text-gray-600">Your current level</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <i className="fas fa-gift text-3xl mb-3 text-green-500"></i>
          <div className="text-lg font-semibold">
            {loyaltyInfo?.tiers[userData.tier]?.multiplier * 100 - 100 || 0}%
          </div>
          <div className="text-sm text-gray-600">Bonus Rate</div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Tier Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loyaltyInfo && Object.entries(loyaltyInfo.tiers).map(([tier, data]) => (
            <div 
              key={tier}
              className={`border-2 rounded-xl p-4 text-center ${
                userData.tier === tier 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className={`text-lg font-bold capitalize mb-2 tier-${tier}`}>
                {tier} Tier
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {data.minPoints}+ points
              </div>
              <div className="text-xs text-gray-500">
                {data.benefits.map((benefit, idx) => (
                  <div key={idx} className="mb-1">• {benefit}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        {userData.transactions && userData.transactions.length > 0 ? (
          <div className="space-y-3">
            {userData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg">
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className={`font-bold ${
                  transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <i className="fas fa-history text-4xl mb-3"></i>
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Loyalty