import { useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading"

import { ProductCard } from "@/shop/components/ProductCart"

import { useProduct } from "@/shop/hooks/useProduct"
import { useProducts } from "@/shop/hooks/useProducts"
import { useCartStore } from "@/shop/store/cart.store"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { toast } from "sonner"



export const ProductPage = () => {
  const { idSlug } = useParams()
  const { data: product, isLoading } = useProduct(idSlug || "")
  const { data: relatedData } = useProducts()

  const relatedProducts = useMemo(() => {
    if (!product || !relatedData?.products?.length) return []
    return relatedData.products.filter((item) => item.id !== product.id)
  }, [product, relatedData])

  const galleryImages = useMemo(() => {
    if (!product?.images?.length) return []
    return Array.from(new Set(product.images)).slice(0, 3)
  }, [product])

  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)


  if (isLoading) {
    return <CustomFullScreenLoading />
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
    )
  }

  const mainImage = galleryImages[0]
  const extraImages = galleryImages.slice(1)

  return (
    <section className="py-10 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </div>
          <Link to="/" className="hover:text-foreground">
            Volver al catalogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/60">
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
            {extraImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {extraImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="aspect-square overflow-hidden rounded-lg border bg-muted/30"
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-montserrat">
                {product.title}
              </h1>
              <p className="text-2xl font-semibold">${product.price}</p>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Cantidad (KG)</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  const result = addItem({
                    productId: product.id,
                    name: product.title,
                    price: product.price,
                    image: product.images[0] || "",
                    kg: quantity,
                  })

                  if (!result.ok) {
                    toast.error(result.error || "No se pudo agregar el producto")
                    return
                  }

                  toast.success("Producto agregado al pedido")
                }}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Agregar al carrito
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
