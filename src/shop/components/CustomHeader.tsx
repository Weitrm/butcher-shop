import { Search, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CustomLogo } from "@/components/custom/CustomLogo";

import { useAuthStore } from "@/auth/store/auth.store";


export const CustomHeader = () => {
  const [cartCount] = useState(0);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { authStatus, isAdmin, logout } = useAuthStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get('query') || '';

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const query = inputRef.current?.value;
    const newSearchParams = new URLSearchParams();
    if (!query) {
      newSearchParams.delete('query');
      return;
    } else {
      newSearchParams.set('query', inputRef.current!.value);
    }
    setSearchParams(newSearchParams);
  };

  return <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <CustomLogo />

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={cn(`text-sm font-medium transition-colors hover:text-primary`,
              !query ? 'underline underline-offset-4' : '' 
            )}>
              Inicio
            </Link>
            <Link to="/historial" className="text-sm font-medium transition-colors hover:text-primary">
              Historial
            </Link>
            <Link to="/pedidos" className="text-sm font-medium transition-colors hover:text-primary">
              Pedidos
            </Link>
            <Link to="/accesorios" className="text-sm font-medium transition-colors hover:text-primary">
              Accesorios
            </Link>
          </nav>

          {/* Search and Cart */}
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
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>}
            </Button>

            {
              authStatus === 'not-authenticated' ?( 
            <Link to='/auth/login'>
              <Button
                variant='default'
                size='sm'
                className="ml-2"
              >
                Login
              </Button>
            </Link>

              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  className="ml-2"
                  onClick={logout}
                >
                  Cerrar sesión
                </Button>
              )
            }    
            {
              isAdmin() && (
                <Link to='/admin'>
                  <Button
                    variant='destructive'
                    size='sm'
                    className="ml-2"
                  >
                    Admin
                  </Button>
                </Link>
              )
            }
          </div>
        </div>
      </div>
    </header>;
};
