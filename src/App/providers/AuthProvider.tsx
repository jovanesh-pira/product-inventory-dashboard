import { createContext, useEffect, useState } from "react";
import {onAuthStateChanged,type User} from "firebase/auth" 
import {auth} from "../../lib/firebace"

type Role =
  | "admin"
  | "manager"
  | "editor"
  | "user"
  | "guest";
type AuthContextType={
    user:User | null,
    role:Role | null,
    loading:boolean
}
export const AuthContext=createContext<AuthContextType | null>(null)


export default function AuthProvider({children}:{children:React.ReactNode}){
    const[loading,setLoading]=useState(true)
    const [user,setUser]=useState<User | null>(null)
    const [role,setRole]=useState<Role | null>(null)
    useEffect(()=>{
        const unsub=onAuthStateChanged(auth,(user)=>{
            console.log(user)
            setUser(user)
            setLoading(false)
           if (!user) setRole(null);
      
      else setRole("admin"); 
               
        })
        return ()=>unsub()
    },[])

   return(
     <AuthContext.Provider value={{user,role,loading}}>{
        children}</AuthContext.Provider>
   )
}