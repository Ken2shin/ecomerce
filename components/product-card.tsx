import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product & {
    rating_avg?: number;
    review_count?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1557882257-2b2cbc8deae3?w=500&q=80';

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            width={300}
            height={300}
          />

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
              -{discountPercent}%
            </div>
          )}

          {/* Stock Badge */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-sm font-bold text-white">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-4">
          {/* Category */}
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.slug.split('-')[0]}
          </span>

          {/* Title */}
          <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary">
            {product.name}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.short_description}
          </p>

          {/* Rating */}
          {product.review_count! > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(product.rating_avg || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {product.currency} {product.discount_price || product.price}
            </span>
            {product.discount_price && (
              <span className="text-sm line-through text-muted-foreground">
                {product.currency} {product.price}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            className="mt-auto w-full gap-2"
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
