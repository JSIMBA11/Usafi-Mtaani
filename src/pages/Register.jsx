// src/pages/Register.jsx
import { useState } from "react";
import { api } from "../api";

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    location: "",
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
      const res = await api.register(form);

      if (res?.user) {
        setStatus({
          loading: false,
          error: "",
          success: "✅ Registration successful! You can now log in.",
        });
      } else {
        throw new Error("Invalid registration response from server");
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.message || "Registration failed. Please try again.",
        success: "",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-10 bg-white rounded-xl shadow-lg fade-in">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Register New User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="input"
            placeholder="Full Name"
            required
          />
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
            type="tel"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="input"
            placeholder="Phone Number"
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
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="input"
            placeholder="Location"
          />

          <button
            type="submit"
            disabled={status.loading}
            className="btn btn-success w-full"
          >
            {status.loading ? "Registering..." : "Register"}
          </button>

          {status.error && (
            <p className="text-red-600 text-sm mt-2 text-center">{status.error}</p>
          )}
          {status.success && (
            <p className="text-green-600 text-sm mt-2 text-center">{status.success}</p>
          )}
        </form>
      </div>
    </div>
  );
}
