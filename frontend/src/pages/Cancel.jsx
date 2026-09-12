import React from "react";
export default function Cancel() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-rose-600 mb-2">Operazione Annullata</h2>
      <p className="text-slate-600 mb-6">La transazione è stata interrotta senza addebiti.</p>
      <a href="/dashboard" className="text-blue-600 underline font-medium">Torna alla dashboard</a>
    </div>
  );
}
