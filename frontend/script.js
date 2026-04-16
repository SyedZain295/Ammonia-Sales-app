const sellBtn = document.getElementById("sellBtn");
const statusEl = document.getElementById("status");
const totalSalesEl = document.getElementById("totalSales");
const totalRevenueEl = document.getElementById("totalRevenue");
const latestSaleEl = document.getElementById("latestSale");
const salesListEl = document.getElementById("salesList");
const amountSlider = document.getElementById("amountSlider");
const amountValueEl = document.getElementById("amountValue");

function getSelectedAmountKg() {
  return Number(amountSlider.value);
}

function syncAmountLabel() {
  amountValueEl.textContent = String(getSelectedAmountKg());
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b91c1c" : "#15803d";
}

function formatMoney(value) {
  return Number(value).toFixed(2);
}

function formatSale(sale) {
  return `${sale.amount_kg} kg at EUR ${formatMoney(sale.price_eur)} (${new Date(
    sale.created_at
  ).toLocaleString()})`;
}

function renderLatestSalesList(sales) {
  if (sales.length === 0) {
    salesListEl.innerHTML = "<li>No sales yet.</li>";
    return;
  }

  salesListEl.innerHTML = sales
    .slice(0, 5)
    .map((sale) => `<li>${formatSale(sale)}</li>`)
    .join("");
}

async function loadSales() {
  const response = await fetch("/api/sales");
  if (!response.ok) throw new Error("Could not load sales");

  const data = await response.json();
  totalSalesEl.textContent = String(data.count);

  const totalRevenue = data.sales.reduce((sum, sale) => sum + Number(sale.price_eur), 0);
  totalRevenueEl.textContent = `EUR ${formatMoney(totalRevenue)}`;

  latestSaleEl.textContent = data.sales.length > 0 ? formatSale(data.sales[0]) : "None yet";
  renderLatestSalesList(data.sales);
}

async function recordSale() {
  sellBtn.disabled = true;
  setStatus("Recording...");

  try {
    const amountKg = getSelectedAmountKg();
    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_kg: amountKg }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Sale failed");

    setStatus("Sale recorded successfully");
    await loadSales();
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  } finally {
    sellBtn.disabled = false;
  }
}

sellBtn.addEventListener("click", recordSale);
amountSlider.addEventListener("input", syncAmountLabel);

syncAmountLabel();
loadSales().catch(() => setStatus("Backend not reachable yet", true));