import { Navigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider"
import { useContext } from "react"

function AuthRequired({children}:{children:React.ReactNode}) {
  const auth = useContext(AuthContext);
   
   
   if(auth?.loading){
     
      return <h1>Loading...</h1>
   }
   if(!auth?.user) return <Navigate to="/login" replace></Navigate>
    
   
  return (
    
    <div>
      
      {children}
    </div>
  )
}

export default AuthRequired
