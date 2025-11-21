// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const res = await api.login(phone, password);
      // Save user info (token, name, points) in localStorage
      localStorage.setItem("user", JSON.stringify(res));
      setStatus({ loading: false, error: "" });
      navigate("/home"); // redirect to dashboard
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-10 bg-white rounded-xl shadow-lg fade-in">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Login to Usafi-Mtaani
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              placeholder="0712345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={status.loading}
            className="btn btn-primary w-full"
          >
            {status.loading ? "Logging in..." : "Login"}
          </button>
          {status.error && (
            <p className="text-red-600 text-sm mt-2 text-center">{status.error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
