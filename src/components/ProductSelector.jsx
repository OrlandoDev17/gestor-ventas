import React, { useState } from "react";

const ProductSelector = ({ title, products, onAddItem, icon }) => {
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState(1);

  // Detect if products is grouped (array of objects with 'label' and 'options')
  const isGrouped = products.length > 0 && products[0].options;

  const handleAdd = () => {
    if (!selectedId) return;

    let product = null;

    if (isGrouped) {
      // Search within groups
      for (const group of products) {
        const found = group.options.find((p) => p.id === parseInt(selectedId));
        if (found) {
          product = found;
          break;
        }
      }
    } else {
      product = products.find((p) => p.id === parseInt(selectedId));
    }

    if (product) {
      onAddItem(product, parseInt(qty));
      setSelectedId("");
      setQty(1);
    }
  };

  return (
    <div className="product-selector-card">
      <h3>
        <i className={icon}></i> {title}
      </h3>
      <div className="selector-row">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="product-select"
        >
          <option value="">-- Seleccionar --</option>

          {isGrouped
            ? products.map((group, idx) => (
                <optgroup key={idx} label={group.label}>
                  {group.options.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.currency === "USD" ? "$" : "Bs."}
                      {p.price.toFixed(2)}
                    </option>
                  ))}
                </optgroup>
              ))
            : products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.currency === "USD" ? "$" : "Bs."}
                  {p.price.toFixed(2)}
                </option>
              ))}
        </select>

        <input
          type="number"
          min="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="qty-input"
        />

        <button
          onClick={handleAdd}
          disabled={!selectedId}
          className="add-btn-small"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default ProductSelector;
