export const useCrypto = () => {
  const swapTokens = async (tokenAddress, amount) => {
    console.log("Scambio token verso:", tokenAddress, "Quantita:", amount);
  };
  return { swapTokens };
};
