import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={styles.wrap}>
      <Sidebar />
      <div style={styles.main}>{children}</div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    backgroundColor: "#0f172a",
    minHeight: "100vh",
  },
  main: {
    flex: 1,
    padding: "28px",
    color: "white",
  },
};
