import { Outlet } from "react-router"
import { CustomHeader } from "../components/CustomHeader"
import { CustomFooter } from "../components/CustomFooter"
import { AlertTriangle } from "lucide-react"
import { useAuthStore } from "@/auth/store/auth.store"

export const ShopLayout = () => {
  const user = useAuthStore((state) => state.user)
  const authStatus = useAuthStore((state) => state.authStatus)
  const isOrderingDisabled = authStatus === "authenticated" && user && !user.isActive

  return (
    <div className="min-h-screen bg-background">
      <CustomHeader />
      {isOrderingDisabled && (
        <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
          <div className="container mx-auto flex items-start gap-2 px-4 py-3 text-sm lg:px-8">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>
              Tu cuenta esta deshabilitada para hacer pedidos. Comunicate con un
              supervisor.
            </p>
          </div>
        </div>
      )}
      <Outlet />
      <CustomFooter />
    </div>
  )
}
