import React from "react";
import { useWeb3 } from "../../hooks/useWeb3";
export default function Web3Auth() {
  const { account, connectWallet } = useWeb3();
  return (
    <div className="p-4 bg-white rounded border border-slate-200 text-center">
      {account ? <p className="text-sm font-mono">Connesso: {account}</p> : (
        <button onClick={connectWallet} className="bg-orange-500 text-white px-4 py-2 rounded font-medium hover:bg-orange-600">
          Connetti MetaMask
        </button>
      )}
    </div>
  );
}
