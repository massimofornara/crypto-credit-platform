import { useState } from "react";
export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    }
  };
  return { account, connectWallet };
};
