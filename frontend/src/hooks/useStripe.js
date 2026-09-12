export const useStripe = () => {
  const createPaymentIntent = async (amount) => {
    console.log("Creazione PaymentIntent per importo:", amount);
  };
  return { createPaymentIntent };
};
