import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddMenu from "./pages/AddMenu";
import MenuList from "./pages/MenuList";
import Menu from "./Menu";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Reservations from "./pages/Reservations";
import UserDetails from "./pages/UserDetails";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-menu" element={<AddMenu />} />
        <Route path="/menu-list" element={<MenuList />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:name" element={<UserDetails />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
