import { createHashRouter, Navigate } from "react-router";
import { lazy } from "react";

import { ShopLayout } from "./shop/layout/ShopLayout";
import { HomePage } from "./shop/pages/home/HomePage";
import { ProductPage } from "./shop/pages/product/ProductPage";
import { LoginPage } from "./auth/pages/login/LoginPage";
import { RegisterPage } from "./auth/pages/register/RegisterPage";
import { DashboardPage } from "./admin/pages/dashboard/DashboardPage";
import { AdminProductsPage } from "./admin/pages/products/AdminProductsPage";
import { AdminProductPage } from "./admin/pages/product/AdminProductPage";
import { HistoryPage } from "./shop/pages/history/HistoryPage";
import { AdminRoute, NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";


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
                element: <RegisterPage />
            },
            {
                path: 'historial',
                element: <HistoryPage />
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
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" />,
    },
]);