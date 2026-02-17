import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

// ✅ Load Razorpay script once
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchOrders = async () => {
    const res = await axios.get(`${API}/api/orders`, authConfig);
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/api/orders/${id}`, { status }, authConfig);
    fetchOrders();
  };

  // ✅ REAL payment: create razorpay order -> open checkout -> verify payment
  const payNow = async (order) => {
    const ok = await loadRazorpay();
    if (!ok) return alert("Razorpay SDK failed to load. Check internet.");

    try {
      // 1) Backend creates Razorpay order
      const createRes = await axios.post(
        `${API}/api/payments/${order._id}/create`,
        {},
        authConfig
      );

      const { keyId, amount, currency, razorpayOrderId, customerName, phone } =
        createRes.data;

      // 2) Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "RestaurantPro",
        description: `Order Payment - ${order.customerName}`,
        order_id: razorpayOrderId,
        prefill: {
          name: customerName || order.customerName,
          contact: phone || order.phone || "",
        },

        handler: async function (response) {
          // 3) Verify at backend (secure)
          await axios.post(
            `${API}/api/payments/verify`,
            {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: "Razorpay",
            },
            authConfig
          );

          alert("✅ Payment Successful!");
          fetchOrders();
        },

        theme: { color: "#22c55e" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment start failed. Check backend routes + token.");
    }
  };

  const badge = (status) => {
    const color =
      status === "Pending"
        ? "#fbbf24"
        : status === "Preparing"
        ? "#3b82f6"
        : status === "Completed"
        ? "#22c55e"
        : "#ef4444";

    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "999px",
          backgroundColor: color,
          color: "#0b1220",
          fontWeight: 800,
          fontSize: "12px",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <h1 style={{ margin: 0 }}>🧾 Orders Management</h1>
          <button onClick={fetchOrders} style={styles.refreshBtn}>
            ⟳ Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div style={styles.empty}>No orders found.</div>
        ) : (
          <div style={styles.grid}>
            {orders.map((o) => (
              <div key={o._id} style={styles.card}>
                <div style={styles.topRow}>
                  <div>
                    <div style={styles.customer}>Customer: {o.customerName}</div>
                    <div style={styles.mini}>
                      Type: <b>{o.orderType || "Parcel"}</b>
                    </div>
                  </div>
                  {badge(o.status)}
                </div>

                {o.orderType === "Delivery" && (
                  <div style={styles.deliveryBox}>
                    <div>
                      <b>Address:</b> {o.deliveryAddress || "-"}
                    </div>
                    <div>
                      <b>Scheduled:</b> {o.scheduledTime || "-"}
                    </div>
                  </div>
                )}

                <div style={styles.total}>
                  Total: <b>₹{o.totalAmount}</b>
                </div>

                <div style={styles.items}>
                  <b>Items:</b>{" "}
                  {o.items?.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                </div>

                {/* ✅ Payment row */}
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>
                    Payment:{" "}
                    <span
                      style={{
                        color: o.paymentStatus === "Paid" ? "#22c55e" : "#fbbf24",
                      }}
                    >
                      {o.paymentStatus || "Unpaid"}
                    </span>
                  </div>

                  {/* ✅ Pay Now (Gateway) */}
                  {o.paymentStatus !== "Paid" && (
                    <button
                      onClick={() => payNow(o)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 800,
                        backgroundColor: "#a855f7",
                        color: "white",
                      }}
                    >
                      💳 Pay Now
                    </button>
                  )}

                  {/* ✅ Invoice link after payment */}
                  {o.paymentStatus === "Paid" && o.invoiceUrl && (
                    <a
                      href={`${API}${o.invoiceUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "#334155",
                        color: "white",
                        fontWeight: 800,
                        textDecoration: "none",
                      }}
                    >
                      🧾 View Invoice
                    </a>
                  )}
                </div>

                <div style={styles.actionRow}>
                  <span style={{ fontWeight: 700 }}>Update Status:</span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    style={styles.select}
                  >
                    <option>Pending</option>
                    <option>Preparing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  page: { minHeight: "100vh" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
  },
  refreshBtn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  empty: {
    marginTop: "18px",
    background: "#1e293b",
    padding: "16px",
    borderRadius: "12px",
    opacity: 0.9,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "16px",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "10px",
  },
  customer: { fontSize: "18px", fontWeight: 900 },
  mini: { marginTop: "6px", opacity: 0.9 },
  deliveryBox: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "12px",
    background: "rgba(15,23,42,0.55)",
    border: "1px solid rgba(255,255,255,0.08)",
    lineHeight: "22px",
  },
  total: { marginTop: "12px" },
  items: { marginTop: "8px", opacity: 0.9 },
  actionRow: {
    marginTop: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "space-between",
  },
  select: {
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    minWidth: "150px",
    fontWeight: 700,
  },
};
