import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";

import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { ProductCard } from "@/shop/components/ProductCart";
import { useProduct } from "@/shop/hooks/useProduct";
import { useProducts } from "@/shop/hooks/useProducts";
import { useCartStore } from "@/shop/store/cart.store";
import { useAuthStore } from "@/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const SUPER_MAX_KG = 9999;

export const ProductPage = () => {
  const { idSlug } = useParams();
  const { data: product, isLoading } = useProduct(idSlug || "");
  const { data: relatedData } = useProducts();

  const relatedProducts = useMemo(() => {
    if (!product || !relatedData?.products?.length) return [];
    return relatedData.products.filter((item) => item.id !== product.id);
  }, [product, relatedData]);

  const galleryImages = useMemo(() => {
    if (!product?.images?.length) return [];
    return Array.from(new Set(product.images));
  }, [product]);

  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;
  const isSuperUser = Boolean(
    user?.isSuperUser ||
      user?.roles?.includes("super-user") ||
      user?.roles?.includes("super"),
  );
  const quantityLimit = isSuperUser
    ? SUPER_MAX_KG
    : Math.max(1, product?.maxKgPerOrder || 1);

  const [quantity, setQuantity] = useState(1);
  const [isBox, setIsBox] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  if (!product) {
    return (
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-montserrat">Producto no encontrado</h1>
          <p className="text-muted-foreground">
            No pudimos encontrar este producto. Vuelve al catalogo para seguir explorando.
          </p>
          <Link to="/">
            <Button variant="default">Volver al catalogo</Button>
          </Link>
        </div>
      </section>
    );
  }

  const mainImage =
    selectedImage && galleryImages.includes(selectedImage)
      ? selectedImage
      : galleryImages[0];
  const hasMultipleImages = galleryImages.length > 1;

  return (
    <section className="py-10 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Inicio
            </Link>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{product.title}</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-3 lg:max-w-xl">
            <div className="grid gap-3 lg:grid-cols-[84px_1fr]">
              {hasMultipleImages && (
                <div className="order-2 lg:order-1">
                  <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted/30 transition-colors ${
                          image === mainImage
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/40"
                        }`}
                        aria-label={`Ver imagen ${index + 1} de ${product.title}`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} miniatura ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`relative overflow-hidden rounded-2xl border bg-muted/60 ${
                  hasMultipleImages ? "order-1 lg:order-2" : ""
                }`}
              >
                <div className="aspect-[4/3] sm:aspect-[5/4]">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Imagen no disponible
                    </div>
                  )}
                </div>
              </div>
            </div>

            {hasMultipleImages && (
              <p className="text-xs text-muted-foreground">
                Toca una miniatura para cambiar la imagen.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-montserrat">{product.title}</h1>
              <p className="text-2xl font-semibold">${product.price}</p>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Cantidad (KG)</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {isSuperUser
                    ? "Sin limite de kg para tu usuario"
                    : `Máximo ${quantityLimit} kg para este producto`}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={isOrderingDisabled}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.min(quantityLimit, prev + 1))}
                    disabled={isOrderingDisabled}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {product.allowBoxes && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isBox ? "outline" : "default"}
                    size="sm"
                    onClick={() => setIsBox(false)}
                    disabled={isOrderingDisabled}
                  >
                    Kg
                  </Button>
                  <Button
                    type="button"
                    variant={isBox ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsBox(true)}
                    disabled={isOrderingDisabled}
                  >
                    Caja
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1"
                disabled={isOrderingDisabled}
                onClick={() => {
                  const result = addItem(
                    {
                      productId: product.id,
                      name: product.title,
                      price: product.price,
                      image: product.images[0] || "",
                      kg: quantity,
                      maxKgPerOrder: product.maxKgPerOrder,
                      allowBoxes: product.allowBoxes,
                      isBox,
                    },
                    { ignoreLimits: isSuperUser },
                  );

                  if (!result.ok) {
                    toast.error(result.error || "No se pudo agregar el producto");
                    return;
                  }

                  toast.success("Producto agregado al pedido");
                }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Agregar al carrito
              </Button>
              <Button asChild variant="outline" className="sm:w-auto">
                <Link to="/">Seguir comprando</Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light">Productos relacionados</h2>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Ver catalogo
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.title}
                price={item.price}
                image={item.images[0]}
                isActive={item.isActive}
                maxKgPerOrder={item.maxKgPerOrder}
                allowBoxes={item.allowBoxes}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
