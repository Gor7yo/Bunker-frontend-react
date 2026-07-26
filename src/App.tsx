import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Room } from './pages/Room/Room';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomCode" element={<Room />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;