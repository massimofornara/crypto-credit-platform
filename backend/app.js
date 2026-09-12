const express = require("express");
const cors = require("cors");
const creditsRouter = require("./routes/credits");
const stripeRouter = require("./routes/stripe");
const transactionsRouter = require("./routes/transactions");
const authMiddleware = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Rotta principale di controllo stato
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Crypto Credit API attiva e funzionante",
    version: "1.0.0"
  });
});

// Rotte pubbliche
app.use("/api/stripe/webhook", stripeRouter);

// Rotte protette
app.use("/api/credits", authMiddleware, creditsRouter);
app.use("/api/transactions", authMiddleware, transactionsRouter);
app.use("/api/stripe", authMiddleware, stripeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
