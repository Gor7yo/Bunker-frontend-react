import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { Room } from "./pages/Room/Room";
import "./App.css";
import { Game } from "./pages/Game/Game";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomCode" element={<Room />} />
      <Route path="/game" element={<Game />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
