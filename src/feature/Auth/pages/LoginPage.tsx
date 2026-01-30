import { AuthContext } from "@/App/providers/AuthProvider"
import { useContext } from "react"
import LoginForm from "../components/LoginForm"
import { Navigate } from "react-router-dom"
function LoginPage() {
  const auth =useContext(AuthContext)
  console.log(auth?.loading)
  if(auth?.loading) return <h1>Loading...</h1>
  if(auth?.user) return <Navigate to="/app" replace></Navigate>
  
  return (
    <div>
      <LoginForm/>
    </div>
  )
}

export default LoginPage

