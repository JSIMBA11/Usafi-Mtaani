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
      case 'bronze': return 'bg-yellow-100 text-yellow-800'
      case 'silver': return 'bg-gray-100 text-gray-600'
      case 'gold': return 'bg-yellow-50 text-yellow-600'
      case 'platinum': return 'bg-blue-50 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'bronze': return 'fas fa-award'
      case 'silver': return 'fas fa-award'
      case 'gold': return 'fas fa-crown'
      case 'platinum': return 'fas fa-gem'
      default: return 'fas fa-award'
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
          <div className="text-4xl font-bold">{userData.points || 0}</div>
          <div className="text-blue-100 text-lg">Total Points</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <i className={`${getTierIcon(userData.tier)} text-4xl mb-3 tier-${userData.tier}`}></i>
          <div className="text-xl font-semibold capitalize">{userData.tier || 'bronze'} Tier</div>
          <div className="text-sm text-gray-600">Your current level</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <i className="fas fa-gift text-4xl mb-3 text-green-500"></i>
          <div className="text-xl font-semibold">
            {loyaltyInfo?.tiers[userData.tier] ? Math.round((loyaltyInfo.tiers[userData.tier].multiplier - 1) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Bonus Rate</div>
        </div>
      </div>

      {/* Progress to next tier */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Your Progress</h3>
        <div className="space-y-4">
          {loyaltyInfo && Object.entries(loyaltyInfo.tiers).map(([tier, data], index, array) => {
            if (index === array.length - 1) return null; // Skip last tier for progress
            
            const nextTier = array[index + 1][0];
            const nextTierData = array[index + 1][1];
            const isCurrentTier = userData.tier === tier;
            const hasReached = userData.points >= data.minPoints;
            
            if (isCurrentTier || hasReached) {
              const progress = Math.min(((userData.points - data.minPoints) / (nextTierData.minPoints - data.minPoints)) * 100, 100);
              
              return (
                <div key={tier} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{tier} Tier → {nextTier} Tier</span>
                    <span className="text-gray-600">{userData.points} / {nextTierData.minPoints} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {progress < 100 
                      ? `${Math.round(nextTierData.minPoints - userData.points)} points needed for ${nextTier} Tier`
                      : 'You qualify for the next tier!'
                    }
                  </div>
                </div>
              );
            }
            return null;
          })}
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
                <i className={`${getTierIcon(tier)} mr-2`}></i>
                {tier} Tier
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {data.minPoints}+ points
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                {data.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <i className="fas fa-check text-green-500 text-xs"></i>
                    {benefit}
                  </div>
                ))}
              </div>
              {userData.tier === tier && (
                <div className="mt-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Current Tier
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">How to Earn Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-money-bill-wave text-blue-600"></i>
            </div>
            <div>
              <div className="font-medium">Make Payments</div>
              <div className="text-sm text-gray-600">Earn 1 point for every $10 spent</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-recycle text-green-600"></i>
            </div>
            <div>
              <div className="font-medium">Recycle More</div>
              <div className="text-sm text-gray-600">Bonus points for eco-friendly activities</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-user-plus text-purple-600"></i>
            </div>
            <div>
              <div className="font-medium">Refer Friends</div>
              <div className="text-sm text-gray-600">Get points when friends join</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <i className="fas fa-bolt text-orange-600"></i>
            </div>
            <div>
              <div className="font-medium">Daily Login</div>
              <div className="text-sm text-gray-600">Bonus for consistent usage</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        {userData.transactions && userData.transactions.length > 0 ? (
          <div className="space-y-3">
            {userData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <i className={`fas ${transaction.type === 'earn' ? 'fa-plus' : 'fa-minus'}`}></i>
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${
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
            <p className="text-sm mt-2">Make your first payment to start earning points!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Loyalty