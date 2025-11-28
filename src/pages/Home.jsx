// src/pages/Home.jsx
import { useEffect, useState } from "react";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";
import ForgotPassword from "../components/ForgotPassword";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { api } from "../api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    // Load user info from localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser({ ...JSON.parse(storedUser), token: storedToken });
    }
  }, []);

  useEffect(() => {
    // Fetch loyalty transactions if logged in
    const fetchTransactions = async () => {
      try {
        if (user?.token) {
          const data = await api.getTransactions(user.token);
          setTransactions(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err.message);
      }
    };
    fetchTransactions();
  }, [user?.token]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setActiveTab("login");
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 fade-in">
      {!user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Usafi-Mtaani 🧹</h1>
          <p className="mb-6">
            Manage waste collection, loyalty rewards, and community engagement.
          </p>

          {/* Auth Tabs */}
          <div className="flex space-x-4 mb-6">
            {["login", "register", "forgot", "reset"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded ${
                  activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "login" && "Login"}
                {tab === "register" && "Register"}
                {tab === "forgot" && "Forgot Password"}
                {tab === "reset" && "Reset Password"}
              </button>
            ))}
          </div>

          {/* Render Active Form */}
          <div className="bg-white shadow-md rounded p-6">
            {activeTab === "login" && <LoginForm setUser={setUser} />}
            {activeTab === "register" && (
              <RegisterForm setActiveTab={setActiveTab} />
            )}
            {activeTab === "forgot" && (
              <ForgotPassword setActiveTab={setActiveTab} />
            )}
            {activeTab === "reset" && (
              <ResetPasswordForm setActiveTab={setActiveTab} />
            )}
          </div>
        </>
      ) : (
        <>
          {/* User details */}
          <div className="glass-effect mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome, {user?.full_name || "User"}
              </h2>
              <p className="text-gray-600">Email: {user?.email || "N/A"}</p>
              <p className="text-gray-600">
                Phone: {user?.phone_number || "N/A"}
              </p>
              <p className="text-gray-600">
                Location: {user?.location || "N/A"}
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
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
                  <span className="font-semibold text-green-600">
                    {t.points} pts
                  </span>
                </li>
              ))}
              {transactions.length === 0 && (
                <li className="text-gray-500">No history yet.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
