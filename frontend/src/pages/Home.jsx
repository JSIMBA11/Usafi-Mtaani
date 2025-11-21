// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { api } from "../api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Load user info from localStorage (set during login)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch loyalty transactions
    (async () => {
      try {
        const token = user?.token;
        if (token) {
          const data = await api.getTransactions(token);
          setTransactions(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err.message);
      }
    })();
  }, [user?.token]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 fade-in">
      {/* User details */}
      <div className="glass-effect mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name || "User"}</h2>
        <p className="text-gray-600">Phone: {user?.phone || "N/A"}</p>
      </div>

      {/* Points display */}
      <div className="points-display mb-6">
        <p className="text-lg">Points Accumulated</p>
        <p className="text-3xl font-bold">{user?.points || 0}</p>
      </div>

      {/* Payment option */}
      <div className="glass-effect mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Options</h3>
        <button className="btn btn-success">
          <i className="fa fa-money-bill-wave"></i> Pay with M-Pesa
        </button>
      </div>

      {/* Rewards claim */}
      <div className="glass-effect mb-6">
        <h3 className="text-lg font-semibold mb-2">Rewards</h3>
        <button className="btn btn-primary">
          <i className="fa fa-gift"></i> Claim Reward
        </button>
      </div>

      {/* Redemption history */}
      <div className="glass-effect">
        <h3 className="text-lg font-semibold mb-2">Redemption History</h3>
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
            <li className="text-gray-500">No history yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
