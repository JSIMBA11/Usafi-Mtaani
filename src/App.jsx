// src/App.jsx
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">Usafi-Mtaani</h1>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6">
        {/* ✅ This renders child routes */}
        <Outlet />
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} Usafi-Mtaani
        </div>
      </footer>
    </div>
  );
}
