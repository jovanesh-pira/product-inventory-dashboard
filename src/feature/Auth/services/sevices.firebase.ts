import { auth } from "@/lib/firebace"
import { signInWithEmailAndPassword, type UserCredential ,signOut,createUserWithEmailAndPassword,updateProfile} from "firebase/auth"
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {db} from "@/lib/firebace"

export  function LoginWithEmail(email:string,password:string):Promise<UserCredential>{
   return  signInWithEmailAndPassword(auth,email,password)
}

export function LogOut():Promise<void>{
   return signOut(auth)
}

export async  function RegisterWithEmail(username: string,email:string,password:string){
  const cred = await createUserWithEmailAndPassword(auth,email,password);
   if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: username });
  }
   await setDoc(doc(db, "users", cred.user.uid), {
    username,
    role: "user",
    email,
    createdAt: serverTimestamp(),
  });
  
  console.log()
  return cred.user;
}