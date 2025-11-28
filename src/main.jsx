// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Loyalty from "./pages/Loyalty.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Register from "./pages/Register.jsx";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// -------------------------------
// ProtectedRoute wrapper
// -------------------------------
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// -------------------------------
// Router configuration
// -------------------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // ✅ Layout with header/footer + <Outlet />
    errorElement: (
      <div className="p-6 text-red-600">
        <h2 className="text-lg font-semibold">Oops! Something went wrong.</h2>
        <p>Unexpected application error occurred.</p>
      </div>
    ),
    children: [
      { index: true, element: <Login /> },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "loyalty",
        element: (
          <ProtectedRoute>
            <Loyalty />
          </ProtectedRoute>
        ),
      },
      {
        path: "forgot-password",
        element: <ForgotPassword setActiveTab={() => {}} />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

// -------------------------------
// Render root
// -------------------------------
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
