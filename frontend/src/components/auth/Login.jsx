import React, { useState } from "react";
export default function Login() {
  const [email, setEmail] = useState("");
  return (
    <form className="space-y-4 max-w-sm mx-auto p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold">Accesso</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input className="w-full border rounded p-2 text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">Invia</button>
    </form>
  );
}
