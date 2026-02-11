import { createHashRouter, Navigate } from "react-router";
import { lazy } from "react";

import { ShopLayout } from "./shop/layout/ShopLayout";
import { HomePage } from "./shop/pages/home/HomePage";
import { ProductPage } from "./shop/pages/product/ProductPage";
import { OrderPage } from "./shop/pages/order/OrderPage";
import { LoginPage } from "./auth/pages/login/LoginPage";
import { DashboardPage } from "./admin/pages/dashboard/DashboardPage";
import { AdminProductsPage } from "./admin/pages/products/AdminProductsPage";
import { AdminProductPage } from "./admin/pages/product/AdminProductPage";
import { AdminOrdersPage } from "./admin/pages/orders/AdminOrdersPage";
import { AdminOrdersHistoryPage } from "./admin/pages/history/AdminOrdersHistoryPage";
import { HistoryPage } from "./shop/pages/history/HistoryPage";
import { AdminRoute, AuthenticatedRoute, NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";
import { AdminUsersPage } from "./admin/pages/users/AdminUsersPage";


const AuthLayout = lazy(() => import('./auth/layout/AuthLayout'));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));

export const appRouter = createHashRouter([

    // Public Shop Routes
    {
        path: "/",
        element: <ShopLayout />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: 'product/:idSlug',
                element: <ProductPage />
            },
            {
                path: 'pedidos',
                element: (
                    <AuthenticatedRoute>
                        <OrderPage />
                    </AuthenticatedRoute>
                )
            },
            {
                path: 'historial',
                element: (
                    <AuthenticatedRoute>
                        <HistoryPage />
                    </AuthenticatedRoute>
                )
            },
        ]
    },
    
    // Auth Routes
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
                element: <Navigate to="/auth/login" />
            },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path: 'register',
                element: <Navigate to="/auth/login" replace />
            },
        ]
    },
    
    // Admin Routes
    {
        path: '/admin',
        element:(
                    <AdminRoute>
                        <AdminLayout />     
                    </AdminRoute>
                ),
        children: [
            {
                index: true,
                element: <DashboardPage />
            },
            {
                path: 'products',
                element: <AdminProductsPage />
            },
            {
                path: 'products/:id',
                element: <AdminProductPage />
            },
            {
                path: 'orders',
                element: <AdminOrdersPage />
            },
            {
                path: 'users',
                element: <AdminUsersPage />
            },
            {
                path: 'history',
                element: <AdminOrdersHistoryPage />
            },
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" />,
    },
]);
