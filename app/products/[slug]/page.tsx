'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product, ProductReview } from '@/types/database';

interface ProductPageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product & { rating_avg?: number; review_count?: number } | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [params.slug]);

  async function loadProduct() {
    try {
      const response = await fetch(`/api/products?search=${params.slug}`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setProduct(data.data[0]);
        loadReviews(data.data[0].id);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews(productId: string) {
    try {
      const response = await fetch(`/api/products?category_id=${productId}`);
      // TODO: Create dedicated reviews endpoint
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  async function handleAddToCart() {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product?.id,
          quantity,
        }),
      });

      if (response.ok) {
        alert('Added to cart!');
        setQuantity(1);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1557882257-2b2cbc8deae3?w=800&q=80';
  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={imageUrl}
                alt={product.name}
                className="object-cover"
                fill
                priority
              />
              {discountPercent > 0 && (
                <div className="absolute right-4 top-4 rounded-full bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground">
                  -{discountPercent}%
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.rating_avg || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Price</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.currency} {product.discount_price || product.price}
                </span>
                {product.discount_price && (
                  <span className="text-lg line-through text-muted-foreground">
                    {product.currency} {product.price}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div>
              <p className={`text-sm font-semibold ${
                product.stock_quantity > 0 ? 'text-green-600' : 'text-destructive'
              }`}>
                {product.stock_quantity > 0
                  ? `In Stock (${product.stock_quantity} available)`
                  : 'Out of Stock'}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-muted"
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                className="flex-1 gap-2"
                disabled={product.stock_quantity === 0}
                size="lg"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Additional Info */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-semibold">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold capitalize">{product.slug.split('-')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{product.rating_avg?.toFixed(1) || 'N/A'}</p>
                <div className="mt-2 flex justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.rating_avg || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-border'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on {product.review_count || 0} reviews
                </p>
              </div>
            </div>
            <div className="md:col-span-2 text-center">
              <p className="text-muted-foreground">Reviews coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
