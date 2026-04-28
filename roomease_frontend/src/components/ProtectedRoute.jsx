import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const location = useLocation();

  if (!isLoggedIn) {
    // Store the attempted route before redirecting
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/ramkrishna/verify/login" />;
  }

  return children;
};

export default ProtectedRoute;
