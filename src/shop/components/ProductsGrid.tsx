import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"
import { ProductCard } from "./ProductCart" 
import { useSearchParams } from "react-router"
import type { Product } from "@/interface/product.interface"

interface Props {
    products: Product[]
}

export const  ProductsGrid = ({products}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = searchParams.get('viewMode') || 'grid'
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    searchParams.set('viewMode', mode);
    setSearchParams(searchParams);

  }
  return (
    <>
      <section className="py-5 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-light">Productos</h2>
              <span className="text-muted-foreground">({products.length} productos)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Products Grid */}
            <div className="flex-1">
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.title}
                    price={product.price}
                    image={product.images[0]}
                    isActive={product.isActive}
                    maxKgPerOrder={product.maxKgPerOrder}
                    allowBoxes={product.allowBoxes}
                    initialKg={0}
                  />
                ))}
              </div> 
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
