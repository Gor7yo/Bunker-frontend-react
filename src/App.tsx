import { Navigate, Route, Routes } from "react-router-dom";

import { Home } from "./pages/Home/Home";
import { Room } from "./pages/Room/Room";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:code" element={<Room />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
