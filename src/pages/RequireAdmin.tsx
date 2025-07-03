import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireAdmin;
