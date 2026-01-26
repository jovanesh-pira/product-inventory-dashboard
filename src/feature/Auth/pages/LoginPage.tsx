import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth"
import {auth} from "@/lib/firebace"

function LoginPage() {
   const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const LoginEvent=async()=>{
    setLoading(true);
    setError(null);
    try{ let user=await signInWithEmailAndPassword(auth,"test@test.com","Bigbang_20")
      console.log(user)
      console.log(user.user)
    }catch(e:unknown){
      const code = typeof e === "object" && e && "code" in e ? String((e as any).code) : "unknown";
      setError(code);
      console.error(e);
    }finally{setLoading(false)}
     
  }
  return (
    <div>
      this is the logingpage
      <button onClick={()=>LoginEvent()}>Login</button>
    </div>
  )
}

export default LoginPage
