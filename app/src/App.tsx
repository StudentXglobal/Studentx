import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";   // Added curly braces
import { Signup } from "./pages/Signup"; // Added curly braces
import { Home } from "./pages/Home";     // Added curly braces

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
