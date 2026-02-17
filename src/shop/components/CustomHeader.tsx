import { ChevronRight, Menu, Search, ShoppingBag, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CustomLogo } from "@/components/custom/CustomLogo";

import { useAuthStore } from "@/auth/store/auth.store";
import { useCartStore } from "@/shop/store/cart.store";

export const CustomHeader = () => {
  const cartTotalKg = useCartStore((state) => state.getTotalKg());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const { authStatus, isAdmin, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;

  const query = searchParams.get("query") || "";
  const mobileIconButtonClass =
    "h-10 w-10 rounded-full border-slate-300 bg-white shadow-sm transition-transform active:scale-95";

  const applySearch = (value: string) => {
    const nextQuery = value.trim();
    const newSearchParams = new URLSearchParams();
    if (!nextQuery) {
      setSearchParams(newSearchParams);
      return;
    }
    newSearchParams.set("query", nextQuery);
    setSearchParams(newSearchParams);
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    applySearch(event.currentTarget.value);
  };

  const handleMobileSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    applySearch(event.currentTarget.value);
    setIsMobileSearchOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const closeMobileSearch = () => setIsMobileSearchOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    closeMobileSearch();
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

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-9 w-64 h-9 bg-white"
                  onKeyDown={handleSearch}
                  defaultValue={query}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isMobileSearchOpen ? "w-44 opacity-100" : "w-0 opacity-0 pointer-events-none",
                )}
              >
                <div className="relative w-44">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    className="h-10 w-full border-slate-300 bg-white pl-9"
                    onKeyDown={handleMobileSearch}
                    defaultValue={query}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className={mobileIconButtonClass}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileSearchOpen((prev) => !prev);
                }}
                aria-expanded={isMobileSearchOpen}
                aria-label={isMobileSearchOpen ? "Cerrar busqueda" : "Abrir busqueda"}
              >
                {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            {isOrderingDisabled ? (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "relative md:h-9 md:w-9 md:rounded-md md:border-transparent md:bg-transparent md:shadow-none md:active:scale-100",
                  mobileIconButtonClass,
                  isMobileSearchOpen && "hidden md:inline-flex",
                )}
                disabled
              >
                <ShoppingBag className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "relative md:h-9 md:w-9 md:rounded-md md:border-transparent md:bg-transparent md:shadow-none md:active:scale-100",
                  mobileIconButtonClass,
                  isMobileSearchOpen && "hidden md:inline-flex",
                )}
                asChild
              >
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

            <Button
              variant="outline"
              size="icon"
              className={cn("md:hidden", mobileIconButtonClass, isMobileSearchOpen && "hidden")}
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsMobileMenuOpen((prev) => !prev);
              }}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

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
            <nav className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-primary active:scale-[0.99]",
                  !query ? "bg-slate-100 text-primary" : "",
                )}
              >
                Inicio
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
              {isOrderingDisabled ? (
                <span className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
                  Pedido
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </span>
              ) : (
                <Link
                  to="/pedidos"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-primary active:scale-[0.99]"
                >
                  Pedido
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              )}
              <Link
                to="/historial"
                onClick={closeMobileMenu}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-primary active:scale-[0.99]"
              >
                Historial
                <ChevronRight className="h-4 w-4 text-slate-400" />
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
