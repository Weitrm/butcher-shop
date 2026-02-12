import { useState, type ChangeEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

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
}

export const ProductCard = ({ id, name, price, image }: ProductCardProps) => {
  const [kg, setKg] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;

  const handleKgChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const nextKg = Math.max(1, Math.min(10, Math.floor(parsed)));
    setKg(nextKg);
  };

  const handleAddToCart = () => {
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-lg">${price}</p>
              <p className="text-xs text-muted-foreground">Selecciona kg</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={10}
                step={1}
                value={kg}
                onChange={handleKgChange}
                className="h-8 w-20 text-sm"
                aria-label={`Kg para ${name}`}
                disabled={isOrderingDisabled}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={isOrderingDisabled}
                className="transition-all duration-300 hover:bg-primary hover:text-primary-foreground border-primary/20 text-xs px-4 py-2 h-8"
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
