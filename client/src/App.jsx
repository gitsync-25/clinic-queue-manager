import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import Display from "./Display";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;