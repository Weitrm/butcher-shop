import { Suspense, useEffect, useState, type ComponentType, type PropsWithChildren } from "react";
import { RouterProvider } from "react-router";
import { appRouter } from "./app.router";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { CustomFullScreenLoading } from "./components/custom/CustomFullScreenLoading";
import { useAuthStore } from "./auth/store/auth.store";

const queryClient = new QueryClient();

type DevtoolsComponent = ComponentType<{ initialIsOpen?: boolean }>;

const ReactQueryDevtoolsLazy = () => {
  const [Devtools, setDevtools] = useState<DevtoolsComponent | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let mounted = true;

    import("@tanstack/react-query-devtools").then((module) => {
      if (!mounted) return;
      setDevtools(() => module.ReactQueryDevtools);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!import.meta.env.DEV || !Devtools) return null;

  return <Devtools initialIsOpen={false} />;
};

const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const { checkAuthStatus } = useAuthStore();
  const hasToken = !!localStorage.getItem("token");

  const { isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: checkAuthStatus,
    retry: false,
    enabled: hasToken,
    refetchInterval: hasToken ? 1000 * 60 * 1.5 : false,
    refetchOnWindowFocus: hasToken,
  });

  if (hasToken && isLoading) {
    return <CustomFullScreenLoading />;
  }

  return children;
};

export const ButcherShopApp = () => {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Toaster />

        <CheckAuthProvider>
          <Suspense fallback={<CustomFullScreenLoading />}>
            <RouterProvider router={appRouter} />
          </Suspense>
        </CheckAuthProvider>

        <ReactQueryDevtoolsLazy />
      </QueryClientProvider>
    </div>
  );
};