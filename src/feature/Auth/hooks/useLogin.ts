import {  useState } from "react"
import {LoginWithEmail}  from "../services/sevices.firebase"



export async function UseLogin(){
    const[loading,setLoading]=useState<boolean>(false)
      const [error, setError] = useState<string | null>(null);
    const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await LoginWithEmail(email, password);
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };
    return { login, loading, error };
}