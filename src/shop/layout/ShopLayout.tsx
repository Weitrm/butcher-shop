import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Outlet } from "react-router"

import { useAuthStore } from "@/auth/store/auth.store"
import { hasSuperUserRole } from "@/lib/user-roles"
import { useCartStore } from "@/shop/store/cart.store"
import { CustomFooter } from "../components/CustomFooter"
import { CustomHeader } from "../components/CustomHeader"

const toPositiveIntOrNull = (value?: number | null) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return null
  return Math.floor(parsed)
}

export const ShopLayout = () => {
  const user = useAuthStore((state) => state.user)
  const authStatus = useAuthStore((state) => state.authStatus)
  const setMaxTotalKg = useCartStore((state) => state.setMaxTotalKg)
  const setMaxItems = useCartStore((state) => state.setMaxItems)

  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false

  const isSuperUser = hasSuperUserRole(user)

  useEffect(() => {
    if (authStatus !== "authenticated" || !user || isSuperUser) {
      setMaxTotalKg(null)
      setMaxItems(null)
      return
    }

    setMaxTotalKg(toPositiveIntOrNull(user.sector?.maxTotalKg))
    setMaxItems(toPositiveIntOrNull(user.sector?.maxItems))
  }, [
    authStatus,
    isSuperUser,
    setMaxItems,
    setMaxTotalKg,
    user,
    user?.id,
    user?.sector?.maxItems,
    user?.sector?.maxTotalKg,
  ])

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
