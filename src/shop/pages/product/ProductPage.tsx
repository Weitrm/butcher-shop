import { products } from "@/mocks/products.mock"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/shop/components/ProductCart"
import { Flame, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useParams } from "react-router"

const toSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export const ProductPage = () => {
  const { idSlug } = useParams()
  const product = useMemo(() => {
    if (!idSlug) return undefined
    const normalizedSlug = toSlug(idSlug)
    return products.find(
      (item) => item.id === idSlug || toSlug(item.name) === normalizedSlug
    )
  }, [idSlug])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return products.filter((item) => item.id !== product.id)
  }, [product])

  const [quantity, setQuantity] = useState(1)


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

  const galleryImages = [
    product.image,
    ...relatedProducts.slice(0, 2).map((item) => item.image),
  ]

  return (
    <section className="py-10 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
          <Link to="/" className="hover:text-foreground">
            Volver al catalogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/60">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="aspect-square overflow-hidden rounded-lg border bg-muted/30"
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {product.category}
              </p>
              <h1 className="text-3xl lg:text-4xl font-montserrat">
                {product.name}
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
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Agregar al carrito
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="border-muted">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Truck className="h-4 w-4" />
                    Envio rapido
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entregas coordinadas en 24/48 hs.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-muted">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    Frescura garantizada
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cortes seleccionados y envasados al vacio.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-muted">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Flame className="h-4 w-4" />
                    Ideal para la parrilla
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sugerencias de coccion y porciones.
                  </p>
                </CardContent>
              </Card>
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
                name={item.name}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
