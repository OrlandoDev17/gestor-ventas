let sales = [];
const STORAGE_KEY = "sweet_sales_v1";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const exchangeRateInput = document.getElementById("exchangeRate");
  const apiStatus = document.getElementById("apiStatus");
  const refreshRateBtn = document.getElementById("refreshRateBtn");

  const productSelect = document.getElementById("productSelect");
  const priceInput = document.getElementById("priceUSD");
  const quantityInput = document.getElementById("quantity");
  const previewVES = document.getElementById("previewVES");

  const salesForm = document.getElementById("salesForm");
  const exportBtn = document.getElementById("exportBtn");
  const clearBtn = document.getElementById("clearBtn");

  // Initial Load
  init();

  // Event Listeners
  refreshRateBtn.addEventListener("click", fetchBCVRate);

  // Auto-fill price when product selected
  productSelect.addEventListener("change", (e) => {
    const option = e.target.selectedOptions[0];
    if (option && option.dataset.price) {
      priceInput.value = option.dataset.price;
    } else if (e.target.value === "custom") {
      priceInput.value = "";
      priceInput.focus();
    }
    calculatePreview();
  });

  // Real-time calculation
  [exchangeRateInput, priceInput, quantityInput].forEach((input) => {
    input.addEventListener("input", calculatePreview);
  });

  // Add Sale
  salesForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addSale();
  });

  // Actions
  exportBtn.addEventListener("click", exportData);
  clearBtn.addEventListener("click", confirmClear);
});

function init() {
  // Set date
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("dateDisplay").innerText =
    new Date().toLocaleDateString("es-VE", dateOptions);

  // Initial Fetch
  fetchBCVRate();

  // Load local storage
  loadSales();
}

async function fetchBCVRate() {
  const apiStatus = document.getElementById("apiStatus");
  const rateInput = document.getElementById("exchangeRate");

  apiStatus.innerText = "Consultando API...";
  apiStatus.style.color = "#8D6E63"; // Brown

  try {
    const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial");
    if (!response.ok) throw new Error("Error en API");

    const data = await response.json();

    if (data && data.promedio) {
      rateInput.value = data.promedio.toFixed(2);
      apiStatus.innerText =
        "Actualizado: " +
        new Date(data.fechaActualizacion).toLocaleTimeString();
      apiStatus.style.color = "#5D4037"; // Darker Brown (Success-ish but in theme)
      calculatePreview(); // Recalculate if values exist
    } else {
      throw new Error("Datos incompletos");
    }
  } catch (error) {
    console.error("API Error:", error);
    apiStatus.innerText = "Modo manual (Error API)";
    apiStatus.style.color = "#D84315"; // Red-Orange
  }
}

function calculatePreview() {
  const rate = parseFloat(document.getElementById("exchangeRate").value) || 0;
  const price = parseFloat(document.getElementById("priceUSD").value) || 0;
  const qty = parseInt(document.getElementById("quantity").value) || 1;

  const totalUSD = price * qty;
  const totalVES = totalUSD * rate;

  document.getElementById(
    "previewVES"
  ).innerText = `Bs. ${totalVES.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function addSale() {
  const productSelect = document.getElementById("productSelect");
  const productName =
    productSelect.value === "custom"
      ? "Personalizado"
      : productSelect.options[productSelect.selectedIndex].text
          .split("(")[0]
          .trim();

  const rate = parseFloat(document.getElementById("exchangeRate").value) || 0;
  const price = parseFloat(document.getElementById("priceUSD").value) || 0;
  const qty = parseInt(document.getElementById("quantity").value) || 1;

  if (price <= 0 || qty <= 0) {
    alert("Por favor ingresa valores válidos.");
    return;
  }

  const totalUSD = price * qty;
  const totalVES = totalUSD * rate;

  const sale = {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    product: productName,
    priceUSD: price,
    qty: qty,
    totalUSD: totalUSD,
    totalVES: totalVES,
    rate: rate,
  };

  sales.push(sale);
  saveSales();
  renderTable();
  resetForm();
}

function resetForm() {
  document.getElementById("productSelect").value = "";
  document.getElementById("priceUSD").value = "";
  document.getElementById("quantity").value = "1";
  document.getElementById("previewVES").innerText = "Bs. 0.00";
}

function saveSales() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  updateSummary();
}

function loadSales() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    sales = JSON.parse(stored);
    renderTable();
    updateSummary();
  }
}

function renderTable() {
  const tbody = document.querySelector("#salesTable tbody");
  tbody.innerHTML = "";

  // Sort by newest first
  const reversedSales = [...sales].reverse();

  reversedSales.forEach((sale) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${sale.time}</td>
            <td>${sale.product}</td>
            <td>$${sale.priceUSD.toFixed(2)}</td>
            <td>${sale.qty}</td>
            <td>Bs. ${sale.totalVES.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}<br><small class="text-muted">@ ${sale.rate}</small></td>
            <td>
                <button class="delete-btn" onclick="deleteSale(${
                  sale.id
                })"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// Make globally available for onclick
window.deleteSale = function (id) {
  if (confirm("¿Borrar esta venta?")) {
    sales = sales.filter((s) => s.id !== id);
    saveSales();
    renderTable();
  }
};

function updateSummary() {
  const totalUSD = sales.reduce((acc, curr) => acc + curr.totalUSD, 0);
  const totalVES = sales.reduce((acc, curr) => acc + curr.totalVES, 0);

  document.getElementById("totalUSD").innerText = `$${totalUSD.toFixed(2)}`;
  document.getElementById(
    "totalVES"
  ).innerText = `Bs. ${totalVES.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function confirmClear() {
  if (
    confirm(
      "¿Estás seguro de BORRAR TODO el historial de hoy? Esta acción no se puede deshacer."
    )
  ) {
    sales = [];
    saveSales();
    renderTable();
  }
}

function exportData() {
  if (sales.length === 0) {
    alert("No hay ventas para exportar.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent +=
    "Hora,Producto,PrecioUnitarioUSD,Cantidad,Tasa,TotalUSD,TotalVES\n";

  sales.forEach((row) => {
    let rowString = `${row.time},"${row.product}",${row.priceUSD},${row.qty},${row.rate},${row.totalUSD},${row.totalVES}`;
    csvContent += rowString + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const today = new Date().toLocaleDateString("es-VE").replace(/\//g, "-");
  link.setAttribute("download", `ventas_dulces_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
