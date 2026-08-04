import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProtectedRoute from "./context/protectedRoute";
import {
  getRouteByRole,
  getStoredRole,
  isLoggedIn,
} from "./context/authSession";

function App() {
  const defaultRoute = isLoggedIn()
    ? getRouteByRole(getStoredRole())
    : "/login";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        {/* <Route element={<ProtectedRoute allowedRoles={['applicant']} redirectTo="/login" />} > */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        {/* </Route> */}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
