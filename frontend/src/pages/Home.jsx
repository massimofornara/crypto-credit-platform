import React from "react";
export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Piattaforma Crypto Credit</h1>
      <p className="text-slate-600 max-w-xl mx-auto mb-8">Piattaforma per la generazione e gestione di crediti, integrata con Stripe e smart contract Polygon.</p>
      <a href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">Accedi alla Dashboard</a>
    </div>
  );
}
