import React from "react";
import CreditsGenerator from "../components/dashboard/CreditsGenerator";
import ConvertToFiat from "../components/dashboard/ConvertToFiat";
import ConvertToCrypto from "../components/dashboard/ConvertToCrypto";
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pannello di Controllo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CreditsGenerator />
        <ConvertToFiat />
        <ConvertToCrypto />
      </div>
    </div>
  );
}
