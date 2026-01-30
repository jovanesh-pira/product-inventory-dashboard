import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebace";

type Role = "admin" | "manager" | "editor" | "user" | "guest";

type UserDoc = {
  username?: string;
  role?: Role;
};

type AuthContextType = {
  user: User | null;
  username: string | null;
  role: Role;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("guest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      setUser(u);

     
      if (!u?.uid) {
        setUsername(null);
        setRole("guest");
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setUsername(null);
          setRole("user"); // or "guest" (your choice)
          return;
        }

        const data = snap.data() as UserDoc;
         console.log(data)
        setUsername(data.username ?? null);
        setRole(data.role ?? "user");
      } catch (err) {
        console.error("AuthProvider: failed to load user doc", err);
        setUsername(null);
        setRole("guest");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, username, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
