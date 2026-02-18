import { useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/shop/store/cart.store";
import { useAuthStore } from "@/auth/store/auth.store";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  isActive: boolean;
  maxKgPerOrder: number;
  allowBoxes: boolean;
  initialKg?: number;
}

const SUPER_MAX_KG = 9999;

export const ProductCard = ({
  id,
  name,
  price,
  image,
  isActive,
  maxKgPerOrder,
  allowBoxes,
  initialKg = 1,
}: ProductCardProps) => {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;
  const isSuperUser = Boolean(
    user?.isSuperUser ||
      user?.roles?.includes("super-user") ||
      user?.roles?.includes("super"),
  );
  const kgLimit = isSuperUser
    ? SUPER_MAX_KG
    : Math.max(1, Math.floor(Number(maxKgPerOrder || 1)));

  const [kg, setKg] = useState(() => {
    const parsed = Number(initialKg);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(0, Math.min(kgLimit, Math.floor(parsed)));
  });
  const [isBox, setIsBox] = useState(false);
  const quantityLabel = isBox ? "cajas" : "kg";

  const addItem = useCartStore((state) => state.addItem);
  const isAddDisabled = isOrderingDisabled || kg < 1;

  const handleKgChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const nextKg = Math.max(0, Math.min(kgLimit, Math.floor(parsed)));
    setKg(nextKg);
  };

  const handleAddToCart = () => {
    if (kg < 1) {
      toast.error(`Selecciona al menos 1 ${isBox ? "caja" : "kg"}`);
      return;
    }

    const result = addItem(
      {
        productId: id,
        name,
        price,
        image,
        kg,
        maxKgPerOrder,
        allowBoxes,
        isBox,
      },
      { ignoreLimits: isSuperUser },
    );

    if (!result.ok) {
      toast.error(result.error || "No se pudo agregar el producto");
      return;
    }

    toast.success("Producto agregado al pedido");
  };

  return (
    <Card className="group border-0 shadow-none product-card-hover cursor-pointer">
      <CardContent className="p-0">
        <Link to={`/product/${id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted rounded-lg">
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {!isActive && (
              <span className="absolute left-2 top-2 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                Oculto
              </span>
            )}
            <div className="image-overlay" />
          </div>

          <div className="pt-6 px-4 pb-3 space-y-1">
            <h3 className="font-medium text-sm tracking-tight">{name}</h3>
          </div>
        </Link>

        <div className="px-4 pb-4">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-lg">
                {isBox ? "Precio no disponible para cajas" : `$${price} / kg`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSuperUser ? "Sin limite de cantidad" : `Maximo ${kgLimit} ${quantityLabel}`}
              </p>
            </div>

            {allowBoxes && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant={isBox ? "outline" : "default"}
                  className="h-8 text-xs"
                  onClick={() => setIsBox(false)}
                >
                  Kg
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant={isBox ? "default" : "outline"}
                  className="h-8 text-xs"
                  onClick={() => setIsBox(true)}
                >
                  Caja
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-8 w-28 items-center overflow-hidden rounded-md border">
                <button
                  type="button"
                  onClick={() => setKg((prev) => Math.max(0, prev - 1))}
                  disabled={isOrderingDisabled || kg <= 0}
                  className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center border-r bg-background p-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Reducir ${quantityLabel} para ${name}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={kgLimit}
                  step={1}
                  value={kg}
                  onChange={handleKgChange}
                  className="h-8 min-w-0 flex-1 rounded-none border-0 px-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label={`${isBox ? "Cajas" : "Kg"} para ${name}`}
                  disabled={isOrderingDisabled}
                />
                <button
                  type="button"
                  onClick={() => setKg((prev) => Math.min(kgLimit, prev + 1))}
                  disabled={isOrderingDisabled || kg >= kgLimit}
                  className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center border-l bg-background p-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Aumentar ${quantityLabel} para ${name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={isAddDisabled}
                className="h-8 w-full min-w-0 sm:flex-1 px-3 text-xs transition-all duration-300 hover:bg-primary hover:text-primary-foreground border-primary/20"
              >
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
