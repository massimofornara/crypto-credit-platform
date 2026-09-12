const express = require("express");
const cors = require("cors");
const creditsRouter = require("./routes/credits");
const stripeRouter = require("./routes/stripe");
const transactionsRouter = require("./routes/transactions");
const authMiddleware = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/stripe/webhook", stripeRouter);
app.use("/api/credits", authMiddleware, creditsRouter);
app.use("/api/transactions", authMiddleware, transactionsRouter);
app.use("/api/stripe", authMiddleware, stripeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
