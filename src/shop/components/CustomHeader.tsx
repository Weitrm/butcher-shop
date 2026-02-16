import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CustomLogo } from "@/components/custom/CustomLogo";

import { useAuthStore } from "@/auth/store/auth.store";
import { useCartStore } from "@/shop/store/cart.store";

export const CustomHeader = () => {
  const cartTotalKg = useCartStore((state) => state.getTotalKg());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const { authStatus, isAdmin, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;

  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get("query") || "";

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const nextQuery = inputRef.current?.value;
    const newSearchParams = new URLSearchParams();
    if (!nextQuery) {
      newSearchParams.delete("query");
      return;
    }
    newSearchParams.set("query", inputRef.current!.value);
    setSearchParams(newSearchParams);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <CustomLogo />

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                !query ? "underline underline-offset-4" : "",
              )}
            >
              Inicio
            </Link>
            {isOrderingDisabled ? (
              <span className="text-sm font-medium text-muted-foreground cursor-not-allowed">
                Pedido
              </span>
            ) : (
              <Link to="/pedidos" className="text-sm font-medium transition-colors hover:text-primary">
                Pedido
              </Link>
            )}
            <Link to="/historial" className="text-sm font-medium transition-colors hover:text-primary">
              Historial
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Buscar productos..."
                  className="pl-9 w-64 h-9 bg-white"
                  onKeyDown={handleSearch}
                  defaultValue={query}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {isOrderingDisabled ? (
              <Button variant="ghost" size="icon" className="relative" disabled>
                <ShoppingBag className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/pedidos">
                  <ShoppingBag className="h-5 w-5" />
                  {cartTotalKg > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {cartTotalKg}
                    </span>
                  )}
                </Link>
              </Button>
            )}

            {authStatus === "not-authenticated" ? (
              <Link to="/auth/login" className="hidden md:block">
                <Button variant="default" size="sm" className="ml-2">
                  Login
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 hidden md:inline-flex"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            )}
            {isAdmin() && (
              <Link to="/admin" className="hidden md:block">
                <Button variant="destructive" size="sm" className="ml-2">
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 py-3 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  !query ? "underline underline-offset-4" : "",
                )}
              >
                Inicio
              </Link>
              {isOrderingDisabled ? (
                <span className="text-sm font-medium text-muted-foreground cursor-not-allowed">
                  Pedido
                </span>
              ) : (
                <Link
                  to="/pedidos"
                  onClick={closeMobileMenu}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Pedido
                </Link>
              )}
              <Link
                to="/historial"
                onClick={closeMobileMenu}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Historial
              </Link>
              {authStatus === "not-authenticated" ? (
                <Link to="/auth/login" onClick={closeMobileMenu}>
                  <Button variant="default" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              )}
              {isAdmin() && (
                <Link to="/admin" onClick={closeMobileMenu}>
                  <Button variant="destructive" size="sm" className="w-full">
                    Admin
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
