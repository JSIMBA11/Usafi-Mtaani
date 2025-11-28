// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const res = await api.login({ email, password });

      if (res?.token && res?.user) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        setStatus({
          loading: false,
          error: "",
          success: "✅ Login successful! Redirecting...",
        });

        setTimeout(() => navigate("/home"), 1200);
      } else {
        throw new Error("Invalid login response from server");
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Login failed. Please try again.",
        success: "",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-10 bg-white rounded-xl shadow-lg fade-in">
        {/* Updated heading */}
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password */}
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
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={status.loading}
            className="btn btn-primary w-full"
          >
            {status.loading ? "Logging in..." : "Login"}
          </button>

          {/* Feedback messages */}
          {status.error && (
            <p className="text-red-600 text-sm mt-2 text-center">
              {status.error}
            </p>
          )}
          {status.success && (
            <p className="text-green-600 text-sm mt-2 text-center">
              {status.success}
            </p>
          )}
        </form>

        {/* Extra links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/forgot-password"
            className="text-blue-600 hover:underline block"
          >
            Forgot your password?
          </Link>
          <Link
            to="/register"
            className="text-blue-600 hover:underline block"
          >
            New user? Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
