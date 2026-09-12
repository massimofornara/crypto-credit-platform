import { useState } from "react";
export const useCredits = () => {
  const [credits, setCredits] = useState(0);
  const generateCredits = async (amount) => {
    setCredits((prev) => prev + amount);
  };
  return { credits, generateCredits };
};
