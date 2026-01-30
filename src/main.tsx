import  { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Providers from "./App/providers/Providers"
import "./Style.css"

createRoot(document.getElementById("root")!).render(

    <StrictMode>
       <Providers/>
    </StrictMode>
)