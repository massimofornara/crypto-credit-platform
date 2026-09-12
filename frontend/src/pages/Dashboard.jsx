import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(250);
  const [walletAddress, setWalletAddress] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("crypto_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedCredits = localStorage.getItem("crypto_credits");
    if (savedCredits) setCredits(Number(savedCredits));
  }, []);

  const saveCredits = (newAmount) => {
    setCredits(newAmount);
    localStorage.setItem("crypto_credits", newAmount);
  };

  const addTransaction = (type, amount, detail) => {
    const history = JSON.parse(localStorage.getItem("crypto_txs") || "[]");
    const newTx = {
      id: "TX-" + Date.now().toString().slice(-6),
      type,
      amount,
      detail,
      date: new Date().toLocaleString()
    };
    localStorage.setItem("crypto_txs", JSON.stringify([newTx, ...history]));
  };

  const handleGenerate = () => {
    const added = 50;
    const updated = credits + added;
    saveCredits(updated);
    addTransaction("Generazione Crediti", `+${added} Crediti`, "Ricarica giornaliera piano Free");
    setStatusMsg(`Hai generato con successo ${added} crediti!`);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const handleFiatWithdraw = (e) => {
    e.preventDefault();
    const val = Number(withdrawAmount);
    if (!val || val <= 0) return alert("Inserisci un importo valido");
    if (val > credits) return alert("Crediti insufficienti!");
    
    const updated = credits - val;
    saveCredits(updated);
    addTransaction("Prelievo Fiat", `-${val} EUR`, "Bonifico SEPA / Stripe Payout");
    setActiveModal(null);
    setWithdrawAmount("");
    setStatusMsg(`Richiesta di prelievo di €${val} inviata a Stripe!`);
    setTimeout(() => setStatusMsg(""), 4000);
  };

  const connectAndWithdrawCrypto = async () => {
    if (!window.ethereum) {
      alert("MetaMask non rilevato! Installa l'estensione MetaMask nel browser.");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const account = accounts[0];
      setWalletAddress(account);
      
      const val = 100;
      if (credits < val) {
        alert("Servono almeno 100 crediti per il prelievo Crypto.");
        return;
      }
      const updated = credits - val;
      saveCredits(updated);
      addTransaction("Prelievo Crypto", `-${val} USDT`, `Trasferimento Polygon a ${account.slice(0,6)}...${account.slice(-4)}`);
      setStatusMsg(`Transazione inviata a Polygon per il wallet ${account.slice(0,6)}...`);
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (err) {
      alert("Connessione wallet annullata o fallita.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner di Benvenuto e Saldo */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-blue-600/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {user ? `Piano: ${user.plan || "Pro"}` : "Sessione Ospite"}
          </span>
          <h2 className="text-3xl font-extrabold mt-2">
            {user ? `Bentornato, ${user.email}` : "Pannello di Controllo"}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gestisci la liquidità e converti i tuoi asset.</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-6 py-4 text-center min-w-[200px]">
          <span className="text-slate-400 text-xs uppercase font-medium">Saldo Crediti</span>
          <div className="text-4xl font-black text-emerald-400 mt-1">{credits} <span className="text-lg font-bold">CR</span></div>
        </div>
      </div>

      {/* Messaggi di notifica */}
      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-center font-medium shadow-sm transition-all">
          {statusMsg}
        </div>
      )}

      {/* Griglia Funzionalità */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Generatore */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">⚡</div>
            <h3 className="text-lg font-bold text-slate-900">Generatore Crediti</h3>
            <p className="text-slate-500 text-sm mt-1">Aggiungi 50 crediti al tuo bilancio con un clic.</p>
          </div>
          <button 
            onClick={handleGenerate}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition duration-150"
          >
            + Genera 50 Crediti
          </button>
        </div>

        {/* Conversione Fiat */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">€</div>
            <h3 className="text-lg font-bold text-slate-900">Conversione Fiat</h3>
            <p className="text-slate-500 text-sm mt-1">Converti crediti virtuali su conto bancario o carta Stripe.</p>
          </div>
          <button 
            onClick={() => setActiveModal("fiat")}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-150"
          >
            Preleva Fiat (EUR)
          </button>
        </div>

        {/* Conversione Crypto */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">₮</div>
            <h3 className="text-lg font-bold text-slate-900">Conversione Crypto</h3>
            <p className="text-slate-500 text-sm mt-1">Ritira 100 USDT su rete Polygon tramite MetaMask.</p>
          </div>
          <button 
            onClick={connectAndWithdrawCrypto}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition duration-150"
          >
            {walletAddress ? `Ritira su ${walletAddress.slice(0,6)}...` : "Connetti Wallet & Ritira"}
          </button>
        </div>
      </div>

      {/* Modal Prelievo Fiat */}
      {activeModal === "fiat" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Preleva in Euro (Stripe)</h3>
            <p className="text-sm text-slate-500">1 Credito = 1 EUR. Saldo disponibile: {credits} EUR</p>
            <form onSubmit={handleFiatWithdraw} className="space-y-4">
              <input 
                type="number"
                max={credits}
                min="1"
                placeholder="Importo da prelevare (es. 50)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl"
                >
                  Conferma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
