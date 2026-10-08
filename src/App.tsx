import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Page, Spinner } from "./components/ui";
import { CreateRoom } from "./pages/CreateRoom/CreateRoom";
import { Home } from "./pages/Home/Home";

// The room (game + LiveKit voice) is the heavy part — load it on demand.
const Room = lazy(() => import("./pages/Room/Room").then((m) => ({ default: m.Room })));

const Loading = () => (
  <Page centered>
    <Spinner size={32} />
  </Page>
);

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/room/:code" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
