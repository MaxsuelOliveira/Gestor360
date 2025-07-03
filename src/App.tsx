import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

// Admin
import AdminLayout from "./pages/AdminLayout";
import RequireAdmin from "./pages/RequireAdmin";

// Pages for Admin
import Company from "./pages/admin/Company";
import Contacts from "./pages/admin/Contacts";
import Helpdesk from "./pages/admin/Helpdesk";
import Server from "./pages/admin/Server";
import Anydesk from "./pages/admin/Anydesk";
import Certificate from "./pages/admin/Certificate";
import Users from "./pages/admin/Users";
import Report from "./pages/admin/Report";

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("userAuth");
    setIsLoggedIn(!!user);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-hidden transition-colors duration-300">
      {isLoggedIn && <Sidebar />}
      <div className="flex-1">
        <Routes>
          {!isLoggedIn && <Route path="/" element={<Login />} />}
          {!isLoggedIn && <Route path="*" element={<Navigate to="/" />} />}

          {isLoggedIn && (
            <>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<div>Suporte</div>} />
              <Route path="/notifications" element={<div>Notificações</div>} />
              <Route path="/messages" element={<div>Mensagens</div>} />

              <Route
                path="/"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route path="companies" element={<Company />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="anydesk" element={<Anydesk />} />
                <Route path="helpdesk" element={<Helpdesk />} />
                <Route path="certificate" element={<Certificate />} />
                <Route path="server" element={<Server />} />
                <Route path="users" element={<Users />} />
                <Route path="report" element={<Report />} />
              </Route>

              <Route
                path="*"
                element={
                  <div className="p-8">
                    <h1 className="text-2xl font-bold">
                      Página não encontrada!
                    </h1>
                  </div>
                }
              />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
