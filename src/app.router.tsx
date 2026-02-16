import { lazy } from "react";
import { createHashRouter, Navigate } from "react-router";

import {
  AdminRoute,
  AuthenticatedRoute,
  NotAuthenticatedRoute,
} from "./components/routes/ProtectedRoutes";

const ShopLayout = lazy(() =>
  import("./shop/layout/ShopLayout").then((module) => ({ default: module.ShopLayout })),
);
const HomePage = lazy(() =>
  import("./shop/pages/home/HomePage").then((module) => ({ default: module.HomePage })),
);
const ProductPage = lazy(() =>
  import("./shop/pages/product/ProductPage").then((module) => ({ default: module.ProductPage })),
);
const OrderPage = lazy(() =>
  import("./shop/pages/order/OrderPage").then((module) => ({ default: module.OrderPage })),
);
const HistoryPage = lazy(() =>
  import("./shop/pages/history/HistoryPage").then((module) => ({ default: module.HistoryPage })),
);
const LoginPage = lazy(() =>
  import("./auth/pages/login/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = lazy(() =>
  import("./admin/pages/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const AdminProductsPage = lazy(() =>
  import("./admin/pages/products/AdminProductsPage").then((module) => ({ default: module.AdminProductsPage })),
);
const AdminProductPage = lazy(() =>
  import("./admin/pages/product/AdminProductPage").then((module) => ({ default: module.AdminProductPage })),
);
const AdminOrdersPage = lazy(() =>
  import("./admin/pages/orders/AdminOrdersPage").then((module) => ({ default: module.AdminOrdersPage })),
);
const AdminUsersPage = lazy(() =>
  import("./admin/pages/users/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })),
);
const AdminOrdersHistoryPage = lazy(() =>
  import("./admin/pages/history/AdminOrdersHistoryPage").then((module) => ({ default: module.AdminOrdersHistoryPage })),
);

const AuthLayout = lazy(() => import("./auth/layout/AuthLayout"));
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout"));

export const appRouter = createHashRouter([
  {
    path: "/",
    element: <ShopLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "product/:idSlug",
        element: <ProductPage />,
      },
      {
        path: "pedidos",
        element: (
          <AuthenticatedRoute>
            <OrderPage />
          </AuthenticatedRoute>
        ),
      },
      {
        path: "historial",
        element: (
          <AuthenticatedRoute>
            <HistoryPage />
          </AuthenticatedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <NotAuthenticatedRoute>
        <AuthLayout />
      </NotAuthenticatedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "products",
        element: <AdminProductsPage />,
      },
      {
        path: "products/:id",
        element: <AdminProductPage />,
      },
      {
        path: "orders",
        element: <AdminOrdersPage />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "history",
        element: <AdminOrdersHistoryPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);