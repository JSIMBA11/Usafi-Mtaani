// src/components/ResetPasswordForm.jsx
import { useState } from "react";
import { api } from "../api";

export default function ResetPasswordForm({ setActiveTab }) {
  const [form, setForm] = useState({
    email: "",
    code: "",
    newPassword: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: "" });

    try {
      const res = await api.resetPassword(form);

      if (res?.success) {
        setStatus({
          loading: false,
          error: "",
          success: "✅ Password reset successful! You can now log in.",
        });

        // Switch back to login after short delay
        setTimeout(() => setActiveTab("login"), 1500);
      } else {
        throw new Error("Invalid reset response from server");
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Reset failed. Please try again.",
        success: "",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
          placeholder="Your email"
          required
        />
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          className="input"
          placeholder="Reset code (from email/SMS)"
          required
        />
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="input"
          placeholder="New password"
          required
        />

        <button
          type="submit"
          disabled={status.loading}
          className="btn btn-primary w-full"
        >
          {status.loading ? "Resetting..." : "Reset Password"}
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
