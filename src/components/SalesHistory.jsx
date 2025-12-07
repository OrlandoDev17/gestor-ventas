import React, { useState } from "react";
import Modal from "./Modal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SalesHistory = ({
  history,
  onClearHistory,
  onDeleteSale,
  onUpdateSale,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // Calculate VES Breakdown
  const vesSales = history.filter((sale) => sale.currency === "VES");

  const totalVesPunto = vesSales
    .filter((s) => s.paymentMethod === "bs_punto")
    .reduce((acc, s) => acc + s.totalVES, 0);

  const totalVesPagoMovil = vesSales
    .filter((s) => s.paymentMethod === "bs_pago_movil")
    .reduce((acc, s) => acc + s.totalVES, 0);

  const totalVesEfectivo = vesSales
    .filter((s) => s.paymentMethod === "bs_efectivo")
    .reduce((acc, s) => acc + s.totalVES, 0);

  const totalRevenueBoxVES =
    totalVesPunto + totalVesPagoMovil + totalVesEfectivo;

  const totalRevenueBoxUSD = history
    .filter((sale) => sale.currency === "USD")
    .reduce((acc, sale) => acc + sale.totalUSD, 0);

  const activeDeliveries = history.filter(
    (sale) => sale.delivery && sale.delivery.active
  );

  const deliveryByDriver = activeDeliveries.reduce((acc, sale) => {
    const driver = sale.delivery.driver || "Desconocido";
    const amount = parseFloat(sale.delivery.amount) || 0;
    acc[driver] = (acc[driver] || 0) + amount;
    return acc;
  }, {});

  const totalDeliveryLiabilities = Object.values(deliveryByDriver).reduce(
    (a, b) => a + b,
    0
  );

  const handleExportPDF = () => {
    if (history.length === 0) return alert("No hay datos para exportar");

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("es-VE");
    const now = new Date().toLocaleTimeString("es-VE");

    // Header
    doc.setFontSize(18);
    doc.setTextColor(62, 39, 35); // Brown
    doc.text("Reporte de Cierre de Caja", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha: ${today} - Hora: ${now}`, 14, 28);

    // Summary Section Data
    doc.setFontSize(12);
    doc.setTextColor(62, 39, 35);
    doc.text("Resumen Financiero", 14, 40);

    const summaryData = [
      ["Concepto", "Monto"],
      [
        "Ventas Bs (Pago Móvil)",
        `Bs. ${totalVesPagoMovil.toLocaleString("es-VE", {
          minimumFractionDigits: 2,
        })}`,
      ],
      [
        "Ventas Bs (Punto)",
        `Bs. ${totalVesPunto.toLocaleString("es-VE", {
          minimumFractionDigits: 2,
        })}`,
      ],
      [
        "Ventas Bs (Efectivo)",
        `Bs. ${totalVesEfectivo.toLocaleString("es-VE", {
          minimumFractionDigits: 2,
        })}`,
      ],
      [
        "Total Bolívares",
        `Bs. ${totalRevenueBoxVES.toLocaleString("es-VE", {
          minimumFractionDigits: 2,
        })}`,
      ],
      ["Total Divisas ($)", `$${totalRevenueBoxUSD.toFixed(2)}`],
      [
        "Deudas Delivery",
        `Bs. ${totalDeliveryLiabilities.toLocaleString("es-VE", {
          minimumFractionDigits: 2,
        })}`,
      ],
    ];

    autoTable(doc, {
      startY: 45,
      head: [["Concepto", "Monto"]],
      body: summaryData.slice(1), // Body minus header
      theme: "grid",
      headStyles: { fillColor: [141, 110, 99] }, // Brown
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
      },
      tableWidth: 100,
    });

    // Detailed Table
    const tableStartY = doc.lastAutoTable.finalY + 15;
    doc.text("Detalle de Ventas", 14, tableStartY - 5);

    const tableRows = history.map((sale) => {
      const itemsStr = sale.items.map((i) => `${i.qty}x ${i.name}`).join(", ");
      const amountStr =
        sale.currency === "USD"
          ? `$${sale.totalUSD.toFixed(2)}`
          : `Bs. ${sale.totalVES.toLocaleString("es-VE", {
              minimumFractionDigits: 2,
            })}`;

      const paymentLabel = getPaymentLabel(sale.paymentMethod);
      const deliveryStr =
        sale.delivery && sale.delivery.active
          ? `${sale.delivery.driver} (+${sale.delivery.amount})`
          : "-";

      return [sale.time, itemsStr, paymentLabel, amountStr, deliveryStr];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [["Hora", "Items", "Método Pago", "Monto", "Delivery"]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [141, 110, 99] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: "right", fontStyle: "bold" },
      },
    });

    doc.save(`cierre_caja_${today.replace(/\//g, "-")}.pdf`);
  };

  const openEditModal = (sale) => {
    setEditingSale(sale);
    setEditAmount(sale.totalVES);
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) return alert("Monto inválido");
    onUpdateSale(editingSale.id, amount);
    setIsEditModalOpen(false);
    setEditingSale(null);
  };

  const getPaymentLabel = (method) => {
    const labels = {
      bs_pago_movil: "Pago Móvil",
      bs_efectivo: "Bs Efectivo",
      bs_punto: "Punto",
      usd_efectivo: "Divisas ($)",
    };
    return labels[method] || method;
  };

  return (
    <React.Fragment>
      <div className="grid-2-responsiveness">
        <section className="summary-section">
          <div className="summary-card total">
            <h3>
              <i className="fa-solid fa-cash-register"></i> Ventas (Ingresos)
            </h3>
            <div className="grid-2" style={{ gap: "20px" }}>
              <div>
                <div className="summary-label">Caja Bolívares</div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    marginTop: "5px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Pago Móvil:</span>
                    <strong>
                      {totalVesPagoMovil.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Punto:</span>
                    <strong>
                      {totalVesPunto.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span>Efectivo:</span>
                    <strong>
                      {totalVesEfectivo.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.3)",
                      marginTop: "5px",
                      paddingTop: "5px",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    Total:{" "}
                    {totalRevenueBoxVES.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
              <div className="divider-vertical">
                <div className="summary-label">Caja Divisas</div>
                <div className="amount-ves">
                  ${totalRevenueBoxUSD.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="summary-section">
          <div className="summary-card liability">
            <h3>
              <i className="fa-solid fa-motorcycle"></i> Cuentas x Pagar
            </h3>
            {Object.keys(deliveryByDriver).length === 0 ? (
              <div style={{ opacity: 0.8, marginTop: "10px" }}>
                No hay deliverys pendientes.
              </div>
            ) : (
              <ul className="liability-list">
                {Object.entries(deliveryByDriver).map(([driver, amount]) => (
                  <li key={driver} className="flex-between">
                    <span>{driver}</span>
                    <strong>
                      Bs.{" "}
                      {amount.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </li>
                ))}
                <li className="liability-total flex-between">
                  <span>Total Deuda:</span>
                  <span>
                    Bs.{" "}
                    {totalDeliveryLiabilities.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </li>
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="sales-list-section">
        <div className="list-header">
          <h2>Ventas Recientes</h2>
          <div className="actions" style={{ display: "flex", gap: "5px" }}>
            <button onClick={handleExportPDF} className="btn-secondary">
              <i className="fa-solid fa-file-pdf"></i> Exportar PDF
            </button>
            <button onClick={onClearHistory} className="btn-danger">
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Resumen</th>
                <th>Monto Venta</th>
                <th>Delivery</th>
                <th>Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history
                .slice()
                .reverse()
                .map((sale) => {
                  const hasDel = sale.delivery && sale.delivery.active;
                  return (
                    <tr key={sale.id}>
                      <td>{sale.time}</td>
                      <td>
                        {sale.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: "0.9rem" }}>
                            {item.qty}x {item.name}
                          </div>
                        ))}
                      </td>
                      <td>
                        <div style={{ fontWeight: "bold" }}>
                          {sale.currency === "USD"
                            ? `$${sale.totalUSD.toFixed(2)}`
                            : `Bs. ${sale.totalVES.toLocaleString("es-VE", {
                                minimumFractionDigits: 2,
                              })}`}
                          {sale.currency === "VES" && sale.manualOverride && (
                            <span
                              title="Editado manualmente"
                              style={{ color: "orange", marginLeft: "5px" }}
                            >
                              *
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {hasDel ? (
                          <div className="delivery-tag">
                            <div>
                              <i className="fa-solid fa-motorcycle"></i>{" "}
                              {sale.delivery.driver}
                            </div>
                            <div style={{ fontSize: "0.8rem" }}>
                              +Bs. {sale.delivery.amount}
                            </div>
                          </div>
                        ) : (
                          <span style={{ opacity: 0.3 }}>-</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`payment-badge ${
                            sale.currency === "USD" ? "usd" : "ves"
                          }`}
                        >
                          {getPaymentLabel(sale.paymentMethod)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          {sale.currency === "VES" && (
                            <button
                              className="delete-btn"
                              onClick={() => openEditModal(sale)}
                              style={{ color: "#F57C00", opacity: 1 }}
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                          )}
                          <button
                            className="delete-btn"
                            onClick={() => onDeleteSale(sale.id)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {history.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No hay ventas registradas hoy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Monto de Venta"
      >
        <div>
          <p style={{ marginBottom: "10px" }}>Edita el monto en Bolívares.</p>
          {editingSale && (
            <div
              style={{
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <small>Originalmente:</small>
              <div>
                <strong>
                  Bs. {editingSale.totalVES.toLocaleString("es-VE")}
                </strong>
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Nuevo Monto (Bs):</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              step="0.01"
              autoFocus
            />
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className="btn-primary" onClick={saveEdit}>
              Guardar Cambios
            </button>
            <button
              className="btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default SalesHistory;
