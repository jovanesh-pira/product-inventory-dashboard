import { useContext } from "react"
import { AuthContext } from "../providers/AuthProvider"
import { Navigate } from "react-router-dom";
export default function RootRedirect() {
  
const auth = useContext(AuthContext)
  if (auth?.loading) return <div>Loading...</div>;

  return auth?.user
    ? <Navigate to="/app/products" replace />
    : <Navigate to="/login" replace />;
}