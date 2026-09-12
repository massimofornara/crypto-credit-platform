import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert("Inserisci una email");
    
    // Salva sessione attiva
    const userData = { email, plan: "Pro", loggedInAt: new Date().toISOString() };
    localStorage.setItem("crypto_user", JSON.stringify(userData));
    navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Accedi alla Piattaforma</h2>
      <p className="text-sm text-slate-500 mb-6 text-center">Inserisci i tuoi dati per entrare nel tuo account</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input 
            type="email" 
            required 
            placeholder="utente@esempio.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-150 mt-2"
        >
          Accedi Subito
        </button>
      </form>
    </div>
  );
}
