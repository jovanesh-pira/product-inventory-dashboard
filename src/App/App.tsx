import { useContext } from "react"
import {AuthContext} from "../App/providers/AuthProvider"
import LoginPage from  "@/feature/Auth/pages/LoginPage"
function App() {
  const auth=useContext(AuthContext)
  console.log(auth)
  if(auth?.loading) return <h1>Loading...</h1>
  return (
    <div>
      <p>{auth?.user?.email}</p>
      this is the App Component
      <LoginPage/>
    </div>
  )
}

export default App
