import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get(`${API}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div style={{ minHeight: "100vh" }}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>📊 Overview</h1>
            <p style={styles.subtitle}>
              Live analytics (Orders + Reservations + Users) — Today:{" "}
              <b>{stats?.today || "-"}</b>
            </p>
          </div>

          <button onClick={fetchStats} style={styles.refreshBtn}>
            ⟳ Refresh
          </button>
        </div>

        {!stats ? (
          <p style={{ opacity: 0.8, marginTop: 18 }}>Loading stats...</p>
        ) : (
          <>
            {/* Cards */}
            <div style={styles.cards}>
              <Card label="Total Orders" value={stats.totalOrders} />
              <Card label="Total Revenue" value={`₹${stats.totalRevenue}`} />
              <Card label="Active Users" value={stats.activeUsers} />
              <Card label="Today Reservations" value={stats.todayReservations} />
              <Card label="Pending Reservations" value={stats.pendingReservations} />
            </div>

            {/* Recent Lists */}
            <div style={styles.grid2}>
              <div style={styles.panel}>
                <h2 style={styles.panelTitle}>🧾 Recent Orders</h2>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders?.map((o) => (
                      <tr key={o._id}>
                        <td style={styles.td}>{o.customerName}</td>
                        <td style={styles.td}>{o.orderType || "Parcel"}</td>
                        <td style={styles.td}>₹{o.totalAmount}</td>
                        <td style={styles.td}>{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                  <p style={styles.muted}>No orders yet.</p>
                )}
              </div>

              <div style={styles.panel}>
                <h2 style={styles.panelTitle}>📅 Recent Reservations</h2>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Table</th>
                      <th style={styles.th}>Date/Time</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentReservations?.map((r) => (
                      <tr key={r._id}>
                        <td style={styles.td}>{r.customerName}</td>
                        <td style={styles.td}>{r.tableNo}</td>
                        <td style={styles.td}>
                          {r.date} {r.time}
                        </td>
                        <td style={styles.td}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {(!stats.recentReservations || stats.recentReservations.length === 0) && (
                  <p style={styles.muted}>No reservations yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function Card({ label, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>{label}</div>
      <div style={styles.cardValue}>{value}</div>
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: { margin: 0, fontSize: "44px", letterSpacing: "0.5px" },
  subtitle: { marginTop: 10, opacity: 0.8 },

  refreshBtn: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
    height: "fit-content",
  },

  cards: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    minHeight: 92,
  },
  cardLabel: { opacity: 0.78, fontSize: 14 },
  cardValue: { marginTop: 10, fontSize: 28, fontWeight: 900 },

  grid2: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: 14,
  },
  panel: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    overflowX: "auto",
  },
  panelTitle: { margin: 0, marginBottom: 10 },
  muted: { opacity: 0.8 },

  table: { width: "100%", borderCollapse: "collapse", marginTop: 8 },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    opacity: 0.85,
    fontSize: 13,
  },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
};
