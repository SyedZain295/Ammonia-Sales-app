const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "db", "sales.db");
const db = new sqlite3.Database(dbPath);
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_kg REAL NOT NULL,
      price_eur REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
async function createSale(amountKg, priceEur) {
  const result = await run(
    "INSERT INTO sales (amount_kg, price_eur) VALUES (?, ?)",
    [amountKg, priceEur]
  );
  const rows = await all("SELECT * FROM sales WHERE id = ?", [result.lastID]);
  return rows[0];
}
function getSales() {
  return all("SELECT * FROM sales ORDER BY id DESC");
}
async function deleteAllSales() {
  await run("DELETE FROM sales");
}
module.exports = { initDb, createSale, getSales, deleteAllSales };
