// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import { api } from "../api";

export default function ForgotPassword({ setActiveTab }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const requestEmailReset = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      await api.requestEmailReset(email);
      setStatus({
        loading: false,
        error: "",
        success: "📧 Reset link sent to your email. Switching to reset...",
      });
      setTimeout(() => setActiveTab("reset"), 1500);
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Failed to send email reset.",
        success: "",
      });
    }
  };

  const requestSMSReset = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      await api.requestSMSReset(phone);
      setStatus({
        loading: false,
        error: "",
        success: "📱 Reset code sent via SMS. Switching to reset...",
      });
      setTimeout(() => setActiveTab("reset"), 1500);
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Failed to send SMS reset.",
        success: "",
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

      {/* Email reset */}
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-2"
          required
        />
        <button
          onClick={requestEmailReset}
          disabled={status.loading}
          className="btn btn-primary w-full"
        >
          {status.loading ? "Sending..." : "Send Email Reset"}
        </button>
      </div>

      {/* SMS reset */}
      <div>
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input mb-2"
          required
        />
        <button
          onClick={requestSMSReset}
          disabled={status.loading}
          className="btn btn-secondary w-full"
        >
          {status.loading ? "Sending..." : "Send SMS Reset"}
        </button>
      </div>

      {/* Feedback messages */}
      {status.error && (
        <p className="mt-2 text-sm text-red-600 text-center">{status.error}</p>
      )}
      {status.success && (
        <p className="mt-2 text-sm text-green-600 text-center">{status.success}</p>
      )}
    </div>
  );
}
