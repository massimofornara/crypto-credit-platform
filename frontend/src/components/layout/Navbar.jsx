import React from "react";
export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <div className="text-xl font-bold tracking-tight">Crypto Credit</div>
      <div className="space-x-6 text-sm font-medium">
        <a href="/" className="hover:text-blue-400">Home</a>
        <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
        <a href="/movimenti" className="hover:text-blue-400">Movimenti</a>
        <a href="/login" className="hover:text-blue-400">Accedi</a>
      </div>
    </nav>
  );
}
