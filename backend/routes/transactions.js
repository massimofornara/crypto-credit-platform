const express = require("express");
const { db, admin } = require("../config/firebase");
const router = express.Router();

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const transactionsRef = db.collection("transactions");
    const query = transactionsRef.where("userId", "==", userId).orderBy("timestamp", "desc");
    const snapshot = await query.get();
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero delle transazioni" });
  }
});

router.post("/", async (req, res) => {
  const { userId, type, amount, currency, tokenName, planId, status } = req.body;
  try {
    const transactionRef = db.collection("transactions").doc();
    await transactionRef.set({
      userId,
      type,
      amount,
      currency,
      tokenName,
      planId,
      status: status || "completed",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true, id: transactionRef.id });
  } catch (error) {
    res.status(500).json({ error: "Errore nella creazione della transazione" });
  }
});

module.exports = router;
