import  { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App/App"
import "./Style.css"
import AuthProvider from './App/providers/AuthProvider'
createRoot(document.getElementById("root")!).render(

    <StrictMode>
        <AuthProvider>
        <App/>
        </AuthProvider>
    </StrictMode>
)