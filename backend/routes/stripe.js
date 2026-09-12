const express = require("express");
const stripe = require("../config/stripe");
const { db, admin } = require("../config/firebase");
const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
  const { amount, currency = "eur", userId } = req.body;
  if (!db) return res.status(500).json({ error: "Database non configurato" });

  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return res.status(404).json({ error: "Utente non trovato" });
  }

  const user = userDoc.data();
  if (user.credits < amount) {
    return res.status(400).json({ error: "Crediti insufficienti" });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { userId, type: "credit_conversion" },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

router.post("/create-checkout-session", async (req, res) => {
  const { planId, userId } = req.body;
  const plans = {
    Pro: {
      priceId: process.env.STRIPE_PRICE_PRO,
      dailyLimit: 1000,
      monthlyWithdrawals: 50,
    },
    Enterprise: {
      priceId: process.env.STRIPE_PRICE_ENTERPRISE,
      dailyLimit: Infinity,
      monthlyWithdrawals: 200,
    },
  };

  const plan = plans[planId];
  if (!plan) {
    return res.status(400).json({ error: "Piano non valido" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: { userId, planId },
  });

  res.json({ sessionId: session.id });
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, planId } = session.metadata;
      const userRef = db.collection("users").doc(userId);
      await userRef.update({
        subscriptionPlan: planId,
        dailyCredits: 0,
        monthlyWithdrawals: 0,
      });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { userId } = paymentIntent.metadata;
      const userRef = db.collection("users").doc(userId);
      const amount = paymentIntent.amount / 100;

      await userRef.update({
        credits: admin.firestore.FieldValue.increment(-amount),
      });

      await db.collection("transactions").add({
        userId,
        type: "fiat_conversion",
        amount,
        currency: paymentIntent.currency.toUpperCase(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: "completed",
      });
    }

    res.json({ received: true });
  }
);

module.exports = router;
