'use client'

import { useBranding } from '@/lib/branding-context'
import { mockProducts } from '@/lib/branding-types'
import { Star, Heart, ShoppingCart, Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function ProductCard({ product }) {
  const { config } = useBranding()
  const { style, showRatings, showPrice, showDiscount, buttonStyle } = config.productCard
  const { imageRatio } = config.productGrid

  const aspectClass = imageRatio === 'square' ? 'aspect-square' : 'aspect-[3/4]'

  const ButtonComponent = () => {
    const buttonVariant = {
      filled: 'default',
      outline: 'outline',
      text: 'ghost',
    }[buttonStyle]

    return <Button variant={buttonVariant} size="sm">Add to Cart</Button>
  }

  if (style === 'minimal') {
    return (
      <div className="group">
        <div className={`relative ${aspectClass} overflow-hidden rounded-lg bg-muted mb-3`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <Badge className="absolute top-2 left-2">{product.badge}</Badge>
          )}
        </div>
        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
        {showRatings && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
          </div>
        )}
        {showPrice && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">${product.price}</span>
            {product.originalPrice && showDiscount && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  if (style === 'hover-actions') {
    return (
      <div className="group">
        <div className={`relative ${aspectClass} overflow-hidden rounded-lg bg-muted mb-3`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <Badge className="absolute top-2 left-2">{product.badge}</Badge>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button className="p-2 bg-white rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button className="p-2 bg-white rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="p-2 bg-white rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
        {showRatings && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
          </div>
        )}
        {showPrice && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">${product.price}</span>
            {product.originalPrice && showDiscount && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  if (style === 'quick-add') {
    return (
      <div className="group">
        <div className={`relative ${aspectClass} overflow-hidden rounded-lg bg-muted mb-3`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <Badge className="absolute top-2 left-2">{product.badge}</Badge>
          )}
          <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
        {showRatings && (
          <div className="flex items-center gap-1 mb-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
          </div>
        )}
        {showPrice && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">${product.price}</span>
            {product.originalPrice && showDiscount && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  if (style === 'elevated') {
    return (
      <div className="group bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className={`relative ${aspectClass} overflow-hidden`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <Badge className="absolute top-2 left-2">{product.badge}</Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
          {showRatings && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            {showPrice && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">${product.price}</span>
                {product.originalPrice && showDiscount && (
                  <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                )}
              </div>
            )}
            <ButtonComponent />
          </div>
        </div>
      </div>
    )
  }

  if (style === 'border-only') {
    return (
      <div className="group border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
        <div className={`relative ${aspectClass} overflow-hidden`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <Badge variant="outline" className="absolute top-2 left-2 bg-background">{product.badge}</Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
          {showRatings && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
            </div>
          )}
          {showPrice && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">${product.price}</span>
              {product.originalPrice && showDiscount && (
                <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export function PreviewProductGrid() {
  const { config } = useBranding()
  const { layout, spacing } = config.productGrid

  const spacingClass = {
    tight: 'gap-2',
    normal: 'gap-4',
    wide: 'gap-8',
  }[spacing]

  const gridClass = {
    'grid-2': `grid grid-cols-2 ${spacingClass}`,
    'grid-3': `grid grid-cols-2 md:grid-cols-3 ${spacingClass}`,
    'grid-4': `grid grid-cols-2 md:grid-cols-4 ${spacingClass}`,
    'masonry': `columns-2 md:columns-3 ${spacingClass}`,
    'list': `flex flex-col ${spacingClass}`,
  }[layout]

  if (layout === 'list') {
    return (
      <section className="p-6">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className={gridClass}>
          {mockProducts.map((product) => (
            <div key={product.id} className="flex gap-4 p-4 border border-border rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
                crossOrigin="anonymous"
              />
              <div className="flex-1">
                <h3 className="font-medium mb-1">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
              <Button>Add to Cart</Button>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (layout === 'masonry') {
    return (
      <section className="p-6">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className={gridClass}>
          {mockProducts.map((product, index) => (
            <div key={product.id} className={`break-inside-avoid mb-4 ${index % 3 === 0 ? 'pt-8' : ''}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      <div className={gridClass}>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
