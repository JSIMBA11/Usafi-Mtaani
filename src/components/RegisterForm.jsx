// src/components/RegisterForm.jsx
import React, { useState } from "react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    location: "",
    password: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        alert("Registration successful!");
        console.log("User registered:", data.user);
      } else {
        setStatus("error");
        alert(`Registration failed: ${data.details || data.error}`);
      }
    } catch (err) {
      setStatus("error");
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto bg-white p-6 rounded shadow"
    >
      <h2 className="text-xl font-semibold">Register</h2>

      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="text"
        name="phone_number"
        placeholder="Phone Number"
        value={formData.phone_number}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {status === "loading" ? "Registering..." : "Register"}
      </button>

      {status === "success" && (
        <p className="text-green-600 mt-2">Registration successful!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 mt-2">Registration failed. Try again.</p>
      )}
    </form>
  );
}
