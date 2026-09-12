import React, { useState, useEffect } from "react";

export default function Movimenti() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("crypto_txs") || "[]");
    setTransactions(list);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Registro Movimenti & Transazioni</h2>
      
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Nessun movimento registrato. Esegui un'operazione dalla Dashboard per vederla apparire qui.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Dettagli</th>
                <th className="p-4">Valore</th>
                <th className="p-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-mono text-xs text-slate-500">{tx.id}</td>
                  <td className="p-4 font-medium text-slate-900">{tx.type}</td>
                  <td className="p-4 text-slate-500">{tx.detail}</td>
                  <td className={`p-4 font-bold ${tx.amount.startsWith("+") ? "text-emerald-600" : "text-slate-900"}`}>
                    {tx.amount}
                  </td>
                  <td className="p-4 text-slate-400 text-xs">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
