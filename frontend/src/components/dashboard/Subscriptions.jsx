import React from "react";
export default function Subscriptions() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h4 className="text-lg font-bold mb-2">Piani di Abbonamento</h4>
      <p className="text-sm text-slate-600 mb-4">Gestisci upgrade e limiti account.</p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">Modifica Piano</button>
    </div>
  );
}
