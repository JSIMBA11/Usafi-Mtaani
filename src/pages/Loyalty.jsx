// src/pages/Loyalty.jsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Loyalty() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    (async () => {
      try {
        const token = user?.token;
        if (token) {
          const data = await api.getTransactions(token);
          setTransactions(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch loyalty transactions:", err.message);
      }
    })();
  }, [user?.token]);

  // Determine tier based on points
  const points = user?.points || 0;
  let tierClass = "tier-bronze";
  let tierLabel = "Bronze";

  if (points >= 500 && points < 1000) {
    tierClass = "tier-silver";
    tierLabel = "Silver";
  } else if (points >= 1000 && points < 2000) {
    tierClass = "tier-gold";
    tierLabel = "Gold";
  } else if (points >= 2000) {
    tierClass = "tier-platinum";
    tierLabel = "Platinum";
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 fade-in">
      {/* Loyalty tier */}
      <div className="glass-effect mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Loyalty Program</h2>
        <p className="text-gray-600">Your current tier:</p>
        <p className={`text-3xl font-bold ${tierClass}`}>{tierLabel}</p>
      </div>

      {/* Points display */}
      <div className="points-display mb-6">
        <p className="text-lg">Total Points</p>
        <p className="text-3xl font-bold">{points}</p>
      </div>

      {/* Rewards claim */}
      <div className="glass-effect mb-6">
        <h3 className="text-lg font-semibold mb-2">Claim Rewards</h3>
        <button className="btn btn-primary">
          <i className="fa fa-gift"></i> Redeem Points
        </button>
      </div>

      {/* Transaction history */}
      <div className="glass-effect">
        <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
        <ul className="space-y-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex flex-col sm:flex-row sm:justify-between border rounded px-3 py-2"
            >
              <span>{t.description}</span>
              <span className="font-semibold text-green-600">{t.points} pts</span>
            </li>
          ))}
          {transactions.length === 0 && (
            <li className="text-gray-500">No transactions yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
