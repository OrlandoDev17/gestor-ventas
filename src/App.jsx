import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import Modal from "./components/Modal";
import ProductSelector from "./components/ProductSelector";
import Cart from "./components/Cart";
import SalesHistory from "./components/SalesHistory";
import {
  DESSERTS,
  DRINKS,
  WHOLE_CAKES,
  ALL_PRODUCTS_GROUPED,
} from "./data/products";

const STORAGE_KEY = "sweet_sales_v4";

function App() {
  const [rate, setRate] = useState(0);
  const [rateStatus, setRateStatus] = useState("Conectando...");
  const [rateStatusColor, setRateStatusColor] = useState("#8D6E63");

  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
    fetchRate();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const fetchRate = async () => {
    setRateStatus("Consultando API...");
    setRateStatusColor("#8D6E63");
    try {
      const response = await fetch(
        "https://ve.dolarapi.com/v1/dolares/oficial"
      );
      if (!response.ok) throw new Error("Error API");
      const data = await response.json();
      if (data && data.promedio) {
        setRate(parseFloat(data.promedio));
        setRateStatus(
          `Actualizado: ${new Date(
            data.fechaActualizacion
          ).toLocaleTimeString()}`
        );
        setRateStatusColor("#2e7d32");
      }
    } catch (error) {
      console.error(error);
      setRateStatus("Modo manual (Error API)");
      setRateStatusColor("#c62828");
    }
  };

  const handleAddToCart = (product, qty) => {
    setCart([...cart, { ...product, qty }]);
    setIsAddModalOpen(false);
  };

  const handleRemoveFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCheckout = (paymentMethod, deliveryData, calculatedTotals) => {
    if (cart.length === 0) return;
    if (rate <= 0) return alert("Por favor verifica la tasa del dólar.");

    const currency = paymentMethod.startsWith("usd") ? "USD" : "VES";

    const newSale = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: [...cart],
      totalUSD: calculatedTotals.totalUSD,
      totalVES: calculatedTotals.totalVES,
      rate,
      paymentMethod,
      currency,
      delivery: deliveryData,
    };

    setHistory([...history, newSale]);
    setCart([]);
  };

  const handleUpdateSale = (id, newTotalVES) => {
    const updatedHistory = history.map((sale) => {
      if (sale.id === id)
        return { ...sale, totalVES: newTotalVES, manualOverride: true };
      return sale;
    });
    setHistory(updatedHistory);
  };

  const handleClearHistory = () => {
    if (confirm("¿Borrar TODO el historial de hoy?")) setHistory([]);
  };

  const handleDeleteSale = (id) => {
    if (confirm("¿Borrar esta venta?"))
      setHistory(history.filter((s) => s.id !== id));
  };

  return (
    <div className="container">
      <Header
        rate={rate}
        onRefreshRate={fetchRate}
        rateStatus={rateStatus}
        rateStatusColor={rateStatusColor}
      />

      <div className="main-content">
        {/* THREE SECTIONS SIDE BY SIDE */}
        <div className="selectors-grid">
          <ProductSelector
            title="Postres"
            products={DESSERTS}
            onAddItem={handleAddToCart}
            icon="fa-solid fa-cake-candles"
          />
          <ProductSelector
            title="Tortas Completas"
            products={WHOLE_CAKES}
            onAddItem={handleAddToCart}
            icon="fa-solid fa-birthday-cake"
          />
          <ProductSelector
            title="Bebidas"
            products={DRINKS}
            onAddItem={handleAddToCart}
            icon="fa-solid fa-bottle-water"
          />
        </div>

        <Cart
          cartItems={cart}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          rate={rate}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        <SalesHistory
          history={history}
          onClearHistory={handleClearHistory}
          onDeleteSale={handleDeleteSale}
          onUpdateSale={handleUpdateSale}
        />
      </div>

      {/* Add Another Modal - Grouped */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Otro Producto"
      >
        <ProductSelector
          title="Selecciona del Menú"
          products={ALL_PRODUCTS_GROUPED}
          onAddItem={handleAddToCart}
          icon="fa-solid fa-boxes-stacked"
        />
      </Modal>
    </div>
  );
}

export default App;
