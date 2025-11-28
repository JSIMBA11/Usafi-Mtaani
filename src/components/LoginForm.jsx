// src/components/LoginForm.jsx
import { useState } from "react";
import { api } from "../api";

export default function LoginForm({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const res = await api.login(form);

      if (res?.token && res?.user) {
        // Save token + user in localStorage
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        setUser(res.user);

        setStatus({
          loading: false,
          error: "",
          success: "✅ Login successful! Redirecting...",
        });
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
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="input"
          placeholder="Password"
          required
        />

        <button
          type="submit"
          disabled={status.loading}
          className="btn btn-primary w-full"
        >
          {status.loading ? "Logging in..." : "Login"}
        </button>

        {status.error && (
          <p className="text-red-600 text-sm text-center mt-2">{status.error}</p>
        )}
        {status.success && (
          <p className="text-green-600 text-sm text-center mt-2">{status.success}</p>
        )}
      </form>
    </div>
  );
}
