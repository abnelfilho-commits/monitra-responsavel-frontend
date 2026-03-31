import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Pacientes from "./pages/Pacientes";
import PacienteHome from "./pages/PacienteHome";
import RegistroForm from "./pages/RegistroForm";
import Historico from "./pages/Historico";
import RegistroDetalhe from "./pages/RegistroDetalhe";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/pacientes"
            element={
              <ProtectedRoute>
                <Pacientes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pacientes/:id"
            element={
              <ProtectedRoute>
                <PacienteHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pacientes/:id/registrar"
            element={
              <ProtectedRoute>
                <RegistroForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pacientes/:id/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />

          <Route
            path="/registros/:registroId"
            element={
              <ProtectedRoute>
                <RegistroDetalhe />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/pacientes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
