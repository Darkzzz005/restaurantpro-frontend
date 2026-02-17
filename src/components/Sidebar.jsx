import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "white",
    fontWeight: 700,
    background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
  });

  return (
    <div style={styles.sidebar}>
      <div style={styles.brand}>RestaurantPro</div>

      <div style={styles.links}>
        <NavLink to="/dashboard" style={linkStyle}>📊 Overview</NavLink>
        <NavLink to="/menu" style={linkStyle}>🍔 Menu</NavLink>
        <NavLink to="/orders" style={linkStyle}>🧾 Orders</NavLink>
        <NavLink to="/reservations" style={linkStyle}>📅 Reservations</NavLink>
        <NavLink to="/users" style={linkStyle}>👤 Users</NavLink>
        <NavLink to="/settings" style={linkStyle}>⚙ Settings</NavLink>
      </div>

      <button onClick={logout} style={styles.logout}>🚪 Logout</button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",          //  smaller
    minWidth: "220px",
    height: "100vh",
    position: "sticky",
    top: 0,
    background: "#111b2e",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  brand: {
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: 0.5,
  },
  links: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  logout: {
    marginTop: "auto",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#ef4444",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },
};
