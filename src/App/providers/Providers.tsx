
import AppRouter from "@/App/routes/AppRouter"
import AuthProvider from "./AuthProvider"
function Providers() {
  return (
   <>
   <AuthProvider>
   <AppRouter></AppRouter>
   </AuthProvider>
   </>
  )
}

export default Providers
