import { createBrowserRouter, Navigate ,RouterProvider} from "react-router-dom";
import AppLayout from "@/App/layouts/AppLayout";
import AuthLayout from "@/App/layouts/AuthLayout";
import LoginPage from "@/feature/Auth/pages/LoginPage";
import RegisterPage from "@/feature/Auth/pages/RegisterPage";
import AuthRequired from "@/App/guards/AuthRequiredRoute";

import DashboardPage from "@/feature/dashboard/pages/DashboardPage";
import ProductsPage from "@/feature/Products/pages/ProductsPage";
import OrdersPage from "@/feature/Orders/pages/OrdersPage";
import CustomersPage from "@/feature/Customers/pages/CustomersPage";
import AnalyticsPage from "@/feature/Analytics/pages/AnalyticsPage";
import SettingsPage from "@/feature/Settings/pages/SettingsPage";
import ProductCreatePage from "@/feature/Products/pages/ProductCreatePage"

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  {
    path: "/app",
    element: (
      <AuthRequired>
        <AppLayout />
      </AuthRequired>
    ),
    children: [
      
      { index: true, element: <Navigate to="/app/dashboard" replace /> },

      { path: "dashboard", element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/new", element: <ProductCreatePage /> },
      // { path: "products/:id/edit", element: <ProductEditPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },

  { path: "/", element: <Navigate to="/app" replace /> },
  { path: "*", element: <div>Not Found</div> },
]);





function AppRouter() {
  return (
   <RouterProvider router={router}></RouterProvider>
  )
}

export default AppRouter
