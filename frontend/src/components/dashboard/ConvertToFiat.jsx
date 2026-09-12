import React from "react";
export default function ConvertToFiat() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h4 className="text-lg font-bold mb-2">Conversione Fiat</h4>
      <p className="text-sm text-slate-600 mb-4">Converti crediti virtuali su conto bancario.</p>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-medium">Preleva Fiat</button>
    </div>
  );
}
