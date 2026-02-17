import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Reservations() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [tableNo, setTableNo] = useState(1);
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [bookedTables, setBookedTables] = useState([]);
  const [list, setList] = useState([]);

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const checkAvailability = async (d, t) => {
    if (!d || !t) return;
    const res = await axios.get(
      `${API}/api/reservations/availability?date=${d}&time=${t}`
    );
    setBookedTables(res.data.bookedTables || []);
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API}/api/reservations`, authConfig);
      setList(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const book = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/api/reservations`, {
        customerName,
        phone,
        date,
        time,
        guests: Number(guests),
        tableNo: Number(tableNo),
        notes,
      });

      setMessage(`Booking created! Status: ${res.data.status}`);
      fetchReservations();
    } catch {
      setMessage("Booking failed");
    }
  };

  const updateStatus = async (id, status) => {
    await axios.put(
      `${API}/api/reservations/${id}/status`,
      { status },
      authConfig
    );
    fetchReservations();
  };

  return (
    <Layout>
      <div style={{ minHeight: "100vh" }}>
        <h1>📅 Reservations</h1>

        <form
          onSubmit={book}
          style={{
            marginTop: 16,
            background: "#1e293b",
            padding: 16,
            borderRadius: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <input placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              checkAvailability(e.target.value, time);
            }}
          />

          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              checkAvailability(date, e.target.value);
            }}
          />

          <div>
            Booked tables: {bookedTables.length === 0 ? "None" : bookedTables.join(", ")}
          </div>

          {bookedTables.includes(Number(tableNo)) && (
            <div style={{ color: "#fbbf24" }}>
              ⚠ This table is already booked — will go to waiting list.
            </div>
          )}

          <input type="number" placeholder="Guests" value={guests} onChange={(e) => setGuests(e.target.value)} />
          <input type="number" placeholder="Table No" value={tableNo} onChange={(e) => setTableNo(e.target.value)} />
          <input placeholder="Special Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <button>Book</button>
        </form>

        {message && <div style={{ marginTop: 10 }}>{message}</div>}

        <h2 style={{ marginTop: 30 }}>Admin View</h2>

        {list.map((r) => (
          <div key={r._id} style={{ marginTop: 10, padding: 10, background: "#1e293b" }}>
            <b>{r.customerName}</b> | Table {r.tableNo} | {r.date} {r.time} | {r.status}
            <select
              value={r.status}
              onChange={(e) => updateStatus(r._id, e.target.value)}
            >
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Waiting</option>
              <option>Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </Layout>
  );
}
