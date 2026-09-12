const express = require("express");
const { db, admin } = require("../config/firebase");
const router = express.Router();

router.post("/generate", async (req, res) => {
  const { userId, amount } = req.body;
  if (!db) return res.status(500).json({ error: "Database non inizializzato" });

  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return res.status(404).json({ error: "Utente non trovato" });
  }

  const user = userDoc.data();
  const plans = {
    Free: { dailyLimit: 100, monthlyWithdrawals: 5 },
    Pro: { dailyLimit: 1000, monthlyWithdrawals: 50 },
    Enterprise: { dailyLimit: Infinity, monthlyWithdrawals: 200 },
  };

  const plan = plans[user.subscriptionPlan];
  if (!plan) {
    return res.status(400).json({ error: "Piano non valido" });
  }

  const today = new Date().toISOString().split("T")[0];
  if (user.lastGeneration?.toDate().toISOString().split("T")[0] === today) {
    if (user.dailyCredits >= plan.dailyLimit) {
      return res.status(400).json({
        error: `Limite giornaliero raggiunto: ${plan.dailyLimit} crediti`,
      });
    }
  } else {
    await userRef.update({
      dailyCredits: 0,
      lastGeneration: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await userRef.update({
    credits: admin.firestore.FieldValue.increment(amount),
    dailyCredits: admin.firestore.FieldValue.increment(amount),
  });

  res.json({ success: true, newBalance: user.credits + amount });
});

module.exports = router;
