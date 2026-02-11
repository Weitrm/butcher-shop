import type { PropsWithChildren } from "react"
import {RouterProvider } from "react-router"
import { appRouter } from "./app.router"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "sonner"

import { CustomFullScreenLoading } from "./components/custom/CustomFullScreenLoading"
import { useAuthStore } from "./auth/store/auth.store"


const queryClient = new QueryClient()

const CheckAuthProvider = ({children}: PropsWithChildren) => {
  const {checkAuthStatus} = useAuthStore();
  const hasToken = !!localStorage.getItem('token');
  
  const {isLoading} = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuthStatus,
    retry: false,
    enabled: hasToken,
    refetchInterval: hasToken ? 1000 * 60 * 1.5 : false,
    refetchOnWindowFocus: hasToken,
  })

  if (hasToken && isLoading) {
    return <CustomFullScreenLoading />
  }


  return children;  
}

export const ButcherShopApp = () => {



  return (
    <div>
      <QueryClientProvider client={queryClient}>
      <Toaster />

      {/* CUSTOM PROVIDER */}
      <CheckAuthProvider>
        <RouterProvider router={appRouter} />
      </CheckAuthProvider>
      
      <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  )
}
