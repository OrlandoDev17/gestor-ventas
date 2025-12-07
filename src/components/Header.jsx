import React from "react";

const Header = ({ rate, onRefreshRate, rateStatus, rateStatusColor }) => {
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = new Date().toLocaleDateString("es-VE", dateOptions);

  return (
    <React.Fragment>
      <header>
        <h1>
          <i className="fa-solid fa-cake-candles"></i> Dulces Ideas
        </h1>
        <div className="date-display">{dateString}</div>
      </header>

      <div className="rate-card">
        <div className="rate-header">
          <i className="fa-solid fa-money-bill-trend-up"></i> Tasa del Día (BCV)
        </div>
        <div className="rate-input-group">
          <span>Bs.</span>
          <input type="number" value={rate} readOnly placeholder="..." />
          <button
            onClick={onRefreshRate}
            className="refresh-btn"
            title="Actualizar Tasa"
          >
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>
        <div className="status-indicator" style={{ color: rateStatusColor }}>
          {rateStatus}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Header;
