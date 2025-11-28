import React from "react";

export default function ErrorBoundary({ error }) {
  return (
    <div className="p-6 text-red-600">
      <h2 className="text-lg font-semibold">Oops! Something went wrong.</h2>
      <p>{error?.message || "Unexpected error occurred."}</p>
    </div>
  );
}
