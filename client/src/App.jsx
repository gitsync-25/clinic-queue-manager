import { Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import Display from "./Display";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/display"
        element={<Display />}
      />
    </Routes>
  );
}

export default App;