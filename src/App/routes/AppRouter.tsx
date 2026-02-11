import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AppLayout from "@/App/layouts/AppLayout";
import AuthLayout from "@/App/layouts/AuthLayout";
import LoginPage from "@/feature/Auth/pages/LoginPage";
import RegisterPage from "@/feature/Auth/pages/RegisterPage";
import AuthRequired from "@/App/guards/AuthRequiredRoute";

import DashboardPage from "@/feature/dashboard/pages/DashboardPage";
import ProductsPage from "@/feature/Products/pages/ProductsPage";
import OrdersListPage from "@/feature/Orders/pages/OrdersListPage";
import CustomersPage from "@/feature/Customers/pages/CustomersPage";
import AnalyticsPage from "@/feature/Analytics/pages/AnalyticsPage";
import SettingsPage from "@/feature/Settings/pages/SettingsPage";
import ProductCreatePage from "@/feature/Products/pages/ProductCreatePage";
import ProductDetailsPage from "@/feature/Products/pages/ProductDetailsPage";
import ProductEditPage_v2 from "@/feature/Products/pages/ProductEditPage_v2";
import OrderDetailsPage from "@/feature/Orders/pages/OrderDetailsPage";
import OrdersSeedPage from "@/feature/Orders/pages/OrdersSeedPage";
import CreateOrder from "@/feature/Orders/pages/CreateOrder";
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
      { path: "products/:id", element: <ProductDetailsPage /> },
      { path: "products/:id/edit", element: <ProductEditPage_v2 /> },
      { path: "orders", element: <OrdersListPage /> },
      { path: "orders/seed", element: <OrdersSeedPage /> },
      { path: "orders/new", element: <CreateOrder /> },
      { path: "orders/:id", element: <OrderDetailsPage /> },

      { path: "customers", element: <CustomersPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },

  { path: "/", element: <Navigate to="/app" replace /> },
  { path: "*", element: <div>Not Found</div> },
]);

function AppRouter() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default AppRouter;
