import React from "react";
export default function CreditsGenerator() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h4 className="text-lg font-bold mb-2">Generatore Crediti</h4>
      <p className="text-sm text-slate-600 mb-4">Aggiungi crediti al tuo saldo giornaliero.</p>
      <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 font-medium">Genera Crediti</button>
    </div>
  );
}
