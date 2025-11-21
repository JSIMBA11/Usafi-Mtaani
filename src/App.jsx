// src/App.jsx
export default function App({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">Usafi-Mtaani</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-gray-500">
          © {new Date().getFullYear()} Usafi-Mtaani
        </div>
      </footer>
    </div>
  );
}
