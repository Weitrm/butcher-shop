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
  initialKg?: number;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  initialKg = 1,
}: ProductCardProps) => {
  const [kg, setKg] = useState(() => {
    const parsed = Number(initialKg);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(0, Math.min(10, Math.floor(parsed)));
  });
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;
  const isAddDisabled = isOrderingDisabled || kg < 1;

  const handleKgChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const nextKg = Math.max(0, Math.min(10, Math.floor(parsed)));
    setKg(nextKg);
  };

  const handleAddToCart = () => {
    if (kg < 1) {
      toast.error("Selecciona al menos 1 kg");
      return;
    }

    const result = addItem({
      productId: id,
      name,
      price,
      image,
      kg,
    });

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
            <div className="image-overlay" />
          </div>

          <div className="pt-6 px-4 pb-3 space-y-1">
            <h3 className="font-medium text-sm tracking-tight">{name}</h3>
          </div>
        </Link>

        <div className="px-4 pb-4">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-lg">${price}</p>
              <p className="text-xs text-muted-foreground">Selecciona kg</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-8 w-28 items-center overflow-hidden rounded-md border">
                <button
                  type="button"
                  onClick={() => setKg((prev) => Math.max(0, prev - 1))}
                  disabled={isOrderingDisabled || kg <= 0}
                  className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center border-r bg-background p-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Reducir kg para ${name}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  value={kg}
                  onChange={handleKgChange}
                  className="h-8 min-w-0 flex-1 rounded-none border-0 px-0 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label={`Kg para ${name}`}
                  disabled={isOrderingDisabled}
                />
                <button
                  type="button"
                  onClick={() => setKg((prev) => Math.min(10, prev + 1))}
                  disabled={isOrderingDisabled || kg >= 10}
                  className="flex h-8 w-8 min-w-8 shrink-0 items-center justify-center border-l bg-background p-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Aumentar kg para ${name}`}
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
