import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Ordenes from "./pages/Ordenes";
import Proveedores from "./pages/Proveedores";
import Reportes from "./pages/Reportes";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="ordenes" element={<Ordenes />} />
            <Route path="proveedores" element={<Proveedores />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
