import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const USDT_POLYGON_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://crypto-credit-platform.onrender.com";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(2400);
  const [walletAddress, setWalletAddress] = useState("0xfa2344834a3c7489d5f3c68341bc3e4e7295f931");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "", link: "" });

  const [activeModal, setActiveModal] = useState(null);
  const [fiatAmount, setFiatAmount] = useState("");
  const [iban, setIban] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("50");

  useEffect(() => {
    const savedUser = localStorage.getItem("crypto_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const defaultUser = { email: "massimo.fornara.2212@gmail.com", plan: "Pro" };
      setUser(defaultUser);
      localStorage.setItem("crypto_user", JSON.stringify(defaultUser));
    }

    const savedCredits = localStorage.getItem("crypto_credits");
    if (savedCredits !== null) {
      setCredits(Number(savedCredits));
    } else {
      setCredits(2400);
      localStorage.setItem("crypto_credits", "2400");
    }

    if (window.ethereum && window.ethereum.selectedAddress) {
      setWalletAddress(window.ethereum.selectedAddress);
    }
  }, []);

  const saveCredits = (newAmount) => {
    setCredits(newAmount);
    localStorage.setItem("crypto_credits", newAmount.toString());
  };

  const addTransaction = (type, amount, detail, txHash = "") => {
    const history = JSON.parse(localStorage.getItem("crypto_txs") || "[]");
    const newTx = {
      id: "TX-" + Date.now().toString().slice(-6),
      type,
      amount,
      detail,
      txHash,
      date: new Date().toLocaleString()
    };
    localStorage.setItem("crypto_txs", JSON.stringify([newTx, ...history]));
  };

  const handleGenerate = () => {
    const added = 50;
    const updated = credits + added;
    saveCredits(updated);
    addTransaction("Generazione Crediti", `+${added} CR`, "Accredito ricarica");
    setStatusMsg({ type: "success", text: `Accreditati +${added} crediti al tuo saldo!`, link: "" });
    setTimeout(() => setStatusMsg({ type: "", text: "", link: "" }), 4000);
  };

  const handleFiatWithdraw = async (e) => {
    e.preventDefault();
    const val = Number(fiatAmount);
    if (!val || val <= 0) return alert("Inserisci un importo valido");
    if (val > credits) return alert("Crediti insufficienti!");

    setLoading(true);
    const cleanIban = iban.replace(/\s+/g, "").toUpperCase();

    try {
      const res = await fetch(`${BACKEND_URL}/api/withdrawals/fiat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: val, iban: cleanIban, userId: user?.email })
      });

      const data = await res.json();
      const updated = credits - val;
      saveCredits(updated);

      addTransaction("Bonifico SEPA", `-${val} EUR`, `Accreditato su ${cleanIban} (${data.cro || "CRO-OK"})`);

      setReceipt({
        title: "Ricevuta Bonifico Bancario SEPA",
        items: [
          { label: "Importo Accreditato", val: `€ ${val},00` },
          { label: "IBAN Beneficiario", val: cleanIban },
          { label: "Codice CRO", val: data.cro || "CRO-OK" },
          { label: "Codice TRN", val: data.trn || "TRN-OK" },
          { label: "Circuito", val: "SEPA Instant Credit Transfer" },
          { label: "Stato", val: "ACCREDITO DISPOSTO" }
        ]
      });

      setStatusMsg({ type: "success", text: `Bonifico di €${val} disposto con successo all'IBAN indicato!`, link: "" });
      setActiveModal(null);
      setFiatAmount("");
      setIban("");
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Errore durante l'invio della richiesta bancaria.", link: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoWithdraw = async (e) => {
    e.preventDefault();
    const val = Number(cryptoAmount);
    if (!val || val <= 0) return alert("Quantità crediti non valida");
    if (val > credits) return alert("Crediti insufficienti!");

    setLoading(true);
    setStatusMsg({ type: "info", text: "Inoltro richiesta al Treasury della piattaforma...", link: "" });

    try {
      let currentAccount = walletAddress;
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        currentAccount = accounts[0];
        setWalletAddress(currentAccount);

        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: USDT_POLYGON_ADDRESS,
              symbol: "USDT",
              decimals: 6,
              image: "https://cryptologos.cc/logos/tether-usdt-logo.png"
            }
          }
        }).catch(() => null);
      }

      const res = await fetch(`${BACKEND_URL}/api/withdrawals/crypto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: val, walletAddress: currentAccount, userId: user?.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore nella richiesta di prelievo");

      const updated = credits - val;
      saveCredits(updated);

      addTransaction(
        "Prelievo Crypto",
        `-${val} USDT`,
        `Destinazione: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`,
        data.txHash || data.refId
      );

      setReceipt({
        title: "Ricevuta Erogazione Fondi",
        items: [
          { label: "Token Richiesti", val: `${val} USDT` },
          { label: "Wallet Destinatario", val: currentAccount },
          { label: "Rete Blockchain", val: "Polygon PoS (ID 137)" },
          { label: "Stato", val: data.realTx ? "CONFERMATO ON-CHAIN" : "DISPOSTO DAL TREASURY" },
          { label: "Riferimento Operazione", val: data.txHash || data.refId }
        ],
        explorerUrl: data.explorerUrl || `https://polygonscan.com/address/${currentAccount}`
      });

      setStatusMsg({
        type: "success",
        text: data.message,
        link: data.explorerUrl || `https://polygonscan.com/address/${currentAccount}`
      });

      setActiveModal(null);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: err.message || "Errore durante la richiesta al server.", link: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="bg-blue-600/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            PIANO: {user?.plan || "PRO"}
          </span>
          <h2 className="text-3xl font-extrabold mt-2">
            Bentornato, {user?.email}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Converti i tuoi crediti generati: erogazione automatica verso IBAN e wallet MetaMask.
          </p>
          {walletAddress && (
            <div className="mt-3 inline-flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              MetaMask: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          )}
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-6 py-4 text-center min-w-[200px]">
          <span className="text-slate-400 text-xs uppercase font-medium">SALDO DISPONIBILE</span>
          <div className="text-4xl font-black text-emerald-400 mt-1">
            {credits} <span className="text-lg font-bold">CR</span>
          </div>
        </div>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-xl text-center font-medium shadow-sm border ${
          statusMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
            : statusMsg.type === "error"
            ? "bg-rose-50 border-rose-300 text-rose-800"
            : "bg-blue-50 border-blue-300 text-blue-800"
        }`}>
          {loading && <span className="inline-block animate-spin mr-2">⏳</span>}
          {statusMsg.text}
          {statusMsg.link && (
            <div className="mt-2">
              <a href={statusMsg.link} target="_blank" rel="noreferrer" className="underline font-bold text-blue-900 bg-white px-3 py-1 rounded shadow-sm inline-block">
                Verifica su PolygonScan ↗
              </a>
            </div>
          )}
        </div>
      )}

      {receipt && (
        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
              <span>✅</span> {receipt.title}
            </h3>
            <button onClick={() => setReceipt(null)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
              ✕ Chiudi
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-sm">
            {receipt.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span className="font-mono font-bold text-slate-800 break-all ml-4">{item.val}</span>
              </div>
            ))}
          </div>
          {receipt.explorerUrl && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <a href={receipt.explorerUrl} target="_blank" rel="noreferrer" className="text-purple-600 font-bold hover:underline">
                Visualizza movimentazioni su PolygonScan ↗
              </a>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">⚡</div>
            <h3 className="text-lg font-bold text-slate-900">Generatore Crediti</h3>
            <p className="text-slate-500 text-sm mt-1">Aggiungi 50 crediti convertibili direttamente al tuo bilancio.</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            + Genera 50 Crediti
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">€</div>
            <h3 className="text-lg font-bold text-slate-900">Ricevi su Conto (IBAN)</h3>
            <p className="text-slate-500 text-sm mt-1">Disponi un bonifico bancario SEPA con ricevuta contabile.</p>
          </div>
          <button
            onClick={() => setActiveModal("fiat")}
            disabled={loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            Invia su IBAN (EUR)
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">₮</div>
            <h3 className="text-lg font-bold text-slate-900">Ricevi su MetaMask</h3>
            <p className="text-slate-500 text-sm mt-1">Eroga token USDT al wallet collegato tramite il Treasury.</p>
          </div>
          <button
            onClick={() => setActiveModal("crypto")}
            disabled={loading}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            Invia a MetaMask
          </button>
        </div>
      </div>

      {activeModal === "fiat" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Disponi Bonifico Bancario</h3>
            <p className="text-sm text-slate-500">Saldo disponibile: {credits} CR (1 CR = € 1,00)</p>
            <form onSubmit={handleFiatWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Importo (€)</label>
                <input
                  type="number"
                  min="1"
                  max={credits}
                  required
                  placeholder="Es. 100"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">IBAN</label>
                <input
                  type="text"
                  required
                  placeholder="IT00X0000000000000000000000"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  Conferma Bonifico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "crypto" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Accredito su MetaMask</h3>
            <p className="text-sm text-slate-500">
              I token vengono inviati dal Treasury della piattaforma all'indirizzo connesso.
            </p>
            <form onSubmit={handleCryptoWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantità Crediti da convertire</label>
                <input
                  type="number"
                  min="1"
                  max={credits}
                  required
                  placeholder="Es. 50"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-800 border border-purple-200">
                <p className="font-semibold">Parametri di Ricezione:</p>
                <p>• Rete: Polygon PoS (ID 137)</p>
                <p>• Destinazione: {walletAddress}</p>
                <p>• Nessun costo di gas a carico del tuo wallet</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl"
                >
                  Conferma Prelievo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
