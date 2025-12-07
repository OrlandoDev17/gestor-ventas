import React, { useState, useEffect } from "react";

const Cart = ({
  cartItems,
  onRemoveItem,
  onCheckout,
  rate,
  onOpenAddModal,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("bs_pago_movil");
  const [hasDelivery, setHasDelivery] = useState(false);
  const [deliveryAmount, setDeliveryAmount] = useState("");
  const [deliveryDriver, setDeliveryDriver] = useState("");

  useEffect(() => {
    if (cartItems.length === 0) {
      setHasDelivery(false);
      setDeliveryAmount("");
      setDeliveryDriver("");
    }
  }, [cartItems.length]);

  if (cartItems.length === 0) return null;

  // Mixed Currency Calculation
  const calculateTotals = () => {
    let totalUSD = 0;
    let totalVES_Base = 0;

    cartItems.forEach((item) => {
      if (item.currency === "USD") {
        totalUSD += item.price * item.qty;
      } else if (item.currency === "VES") {
        totalVES_Base += item.price * item.qty;
      }
    });

    const totalVES_Converted = totalUSD * rate;
    const totalVES_Final = totalVES_Converted + totalVES_Base;

    return { totalUSD, totalVES_Base, totalVES_Final };
  };

  const { totalUSD, totalVES_Base, totalVES_Final } = calculateTotals();
  const deliveryFeeVES = hasDelivery ? parseFloat(deliveryAmount) || 0 : 0;
  const totalToPayVES = totalVES_Final + deliveryFeeVES;

  const handleCheckoutClick = () => {
    if (hasDelivery && (!deliveryAmount || !deliveryDriver)) {
      alert("Por favor completa los datos del delivery.");
      return;
    }

    const deliveryData = {
      active: hasDelivery,
      amount: deliveryFeeVES,
      driver: hasDelivery ? deliveryDriver : null,
    };

    // Approximate Total USD reference
    const approximateTotalUSD =
      totalUSD + totalVES_Base / (rate > 0 ? rate : 1);

    onCheckout(paymentMethod, deliveryData, {
      totalUSD: approximateTotalUSD,
      totalVES: totalVES_Final,
    });
  };

  return (
    <section className="cart-section">
      <div className="flex-between">
        <h2>
          <i className="fa-solid fa-cart-shopping"></i> Orden Actual
        </h2>
        <button className="btn-secondary" onClick={onOpenAddModal}>
          <i className="fa-solid fa-plus"></i> Agregar Otro Producto
        </button>
      </div>

      <div className="cart-items">
        {cartItems.map((item, index) => (
          <div key={index} className="cart-item">
            <div>
              <strong>{item.name}</strong> <small>x{item.qty}</small>
              <span
                className={`currency-badge-small ${
                  item.currency === "VES" ? "ves" : "usd"
                }`}
              >
                {item.currency}
              </span>
            </div>
            <div className="flex-between" style={{ gap: "10px" }}>
              <span>
                {item.currency === "USD" ? "$" : "Bs. "}
                {(item.price * item.qty).toFixed(2)}
              </span>
              <button
                className="delete-btn"
                onClick={() => onRemoveItem(index)}
                title="Quitar"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary-box">
        <div className="flex-between">
          <span>Subtotal:</span>
          <strong>
            Bs.{" "}
            {totalVES_Final.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
            })}
          </strong>
        </div>
        {hasDelivery && (
          <div className="flex-between" style={{ color: "#d32f2f" }}>
            <span>+ Delivery:</span>
            <strong>
              Bs.{" "}
              {deliveryFeeVES.toLocaleString("es-VE", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>
        )}
        <div className="cart-total-divider"></div>
        <div className="flex-between total-row">
          <span>Total a Cobrar:</span>
          <span>
            Bs.{" "}
            {totalToPayVES.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.9rem", opacity: 0.7 }}>
          Ref USD: ${totalUSD.toFixed(2)} + (Bs.{totalVES_Base.toFixed(2)})
        </div>
      </div>

      <div className="checkout-area">
        <div className="form-group">
          <label>Método de Pago:</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="large-select"
          >
            <option value="bs_pago_movil">Bs - Pago Móvil</option>
            <option value="bs_efectivo">Bs - Efectivo</option>
            <option value="bs_punto">Bs - Punto de Venta</option>
            <option value="usd_efectivo">Divisas ($) - Efectivo</option>
          </select>
        </div>

        <div className="delivery-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasDelivery}
              onChange={(e) => setHasDelivery(e.target.checked)}
            />
            <span>¿Incluye Delivery?</span>
          </label>

          {hasDelivery && (
            <div className="delivery-fields slide-down">
              <div className="grid-2">
                <div className="form-group">
                  <label>Motorizado</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan"
                    value={deliveryDriver}
                    onChange={(e) => setDeliveryDriver(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Costo (Bs)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={deliveryAmount}
                    onChange={(e) => setDeliveryAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleCheckoutClick}
          className="btn-primary checkout-btn"
        >
          <i className="fa-solid fa-check-circle"></i> Registrar Venta
        </button>
      </div>
    </section>
  );
};

export default Cart;
