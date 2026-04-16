const express = require("express");
const cors = require("cors");
const { initDb, createSale, getSales, deleteAllSales } = require("./db");

const app = express();
const FIXED_AMOUNT_KG = 1;
const FIXED_PRICE_EUR = Number(process.env.FIXED_PRICE_EUR || 0.7);
const startedAt = Date.now();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ammonia-sales-backend",
    uptime_seconds: Math.floor((Date.now() - startedAt) / 1000),
    db: "ok",
  });
});

app.get("/api/sales", async (_req, res) => {
  try {
    const sales = await getSales();
    res.json({ count: sales.length, sales });
  } catch (error) {
    console.error("[sales:list:error]", error);
    res.status(500).json({ success: false, error: "Failed to fetch sales" });
  }
});

app.post("/api/sales", async (req, res) => {
  try {
    const rawAmountKg = req.body?.amount_kg ?? FIXED_AMOUNT_KG;
    const amountKg = Number(rawAmountKg);

    if (
      !Number.isFinite(amountKg) ||
      Number.isNaN(amountKg) ||
      !Number.isInteger(amountKg) ||
      amountKg < 1 ||
      amountKg > 1000
    ) {
      return res.status(400).json({
        success: false,
        error: "amount_kg must be an integer between 1 and 1000",
      });
    }

    const priceEur = Number((amountKg * FIXED_PRICE_EUR).toFixed(2));
    const sale = await createSale(amountKg, priceEur);

    res.status(201).json({
      message: "Sale recorded",
      amount_kg: sale.amount_kg,
      price_eur: sale.price_eur,
    });
  } catch (error) {
    console.error("[sale:create:error]", error);
    res.status(500).json({ success: false, error: "Failed to record sale" });
  }
});

app.delete("/api/sales", async (_req, res) => {
  try {
    await deleteAllSales();
    res.json({ success: true, message: "All sales cleared" });
  } catch (error) {
    console.error("[sales:clear:error]", error);
    res.status(500).json({ success: false, error: "Failed to clear sales" });
  }
});

async function start() {
  await initDb();
}

module.exports = { app, start };