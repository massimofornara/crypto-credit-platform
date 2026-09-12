import React from "react";
export default function Success() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-emerald-600 mb-2">Operazione Completata!</h2>
      <p className="text-slate-600 mb-6">Il pagamento o l'aggiornamento del credito è andato a buon fine.</p>
      <a href="/dashboard" className="text-blue-600 underline font-medium">Torna alla dashboard</a>
    </div>
  );
}
