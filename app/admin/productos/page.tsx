'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Package,
  Image as ImageIcon,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number | null;
  currency: string;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  category_id: string;
  specifications: Record<string, any>;
}

interface Category {
  id: string;
  name: string;
  nombre?: string;
}

const initialProductForm = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: 0,
  discount_price: null as number | null,
  currency: 'NIO',
  stock_quantity: 0,
  sku: '',
  is_active: true,
  is_featured: false,
  images: [] as string[],
  category_id: '',
  specifications: {},
};

export default function AdminProductosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state
  const [productForm, setProductForm] = useState(initialProductForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.role === 'admin') {
          setUser(data);
          setAuthorized(true);
          loadData();
        } else {
          router.push('/');
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('[v0] Auth error:', error);
      router.push('/auth/login');
    }
  }

  async function loadData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/categories'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(Array.isArray(productsData) ? productsData : productsData?.data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || []);
    } catch (error) {
      console.error('[v0] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!productForm.name || productForm.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!productForm.description || productForm.description.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    if (!productForm.short_description || productForm.short_description.length < 5) {
      errors.short_description = 'La descripción corta debe tener al menos 5 caracteres';
    }
    if (!productForm.price || productForm.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    if (!productForm.sku || productForm.sku.length < 3) {
      errors.sku = 'El SKU debe tener al menos 3 caracteres';
    }
    if (!productForm.category_id) {
      errors.category_id = 'Debe seleccionar una categoría';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          slug: productForm.slug || generateSlug(productForm.name),
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setProductForm(initialProductForm);
        loadData();
      } else {
        const error = await response.json();
        console.error('[v0] Error creating product:', error);
        setFormErrors({ general: error.error || 'Error al crear el producto' });
      }
    } catch (error) {
      console.error('[v0] Error creating product:', error);
      setFormErrors({ general: 'Error de conexión' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !selectedProduct) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedProduct(null);
        setProductForm(initialProductForm);
        loadData();
      } else {
        const error = await response.json();
        console.error('[v0] Error updating product:', error);
        setFormErrors({ general: error.error || 'Error al actualizar el producto' });
      }
    } catch (error) {
      console.error('[v0] Error updating product:', error);
      setFormErrors({ general: 'Error de conexión' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedProduct(null);
        loadData();
      } else {
        const error = await response.json();
        console.error('[v0] Error deleting product:', error);
      }
    } catch (error) {
      console.error('[v0] Error deleting product:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      price: product.price,
      discount_price: product.discount_price,
      currency: product.currency,
      stock_quantity: product.stock_quantity,
      sku: product.sku,
      is_active: product.is_active,
      is_featured: product.is_featured,
      images: product.images || [],
      category_id: product.category_id,
      specifications: product.specifications || {},
    });
    setFormErrors({});
    setShowEditModal(true);
  }

  function openDeleteModal(product: Product) {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }

  function addImage() {
    if (newImageUrl && newImageUrl.startsWith('http')) {
      setProductForm({
        ...productForm,
        images: [...productForm.images, newImageUrl],
      });
      setNewImageUrl('');
    }
  }

  function removeImage(index: number) {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, i) => i !== index),
    });
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Convertimos esto en una función normal que devuelve JSX, no un Componente React
  const renderFormFields = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {formErrors.general}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Producto *
          </label>
          <Input
            value={productForm.name}
            onChange={(e) => {
              setProductForm({
                ...productForm,
                name: e.target.value,
                slug: generateSlug(e.target.value),
              });
            }}
            placeholder="Ej: Batido de Chocolate"
            className={formErrors.name ? 'border-red-500' : ''}
          />
          {formErrors.name && (
            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU *
          </label>
          <Input
            value={productForm.sku}
            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
            placeholder="Ej: BAT-CHOC-001"
            className={formErrors.sku ? 'border-red-500' : ''}
          />
          {formErrors.sku && (
            <p className="text-red-500 text-xs mt-1">{formErrors.sku}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug (URL)
        </label>
        <Input
          value={productForm.slug}
          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
          placeholder="batido-de-chocolate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción Corta *
        </label>
        <Input
          value={productForm.short_description}
          onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
          placeholder="Descripción breve del producto"
          className={formErrors.short_description ? 'border-red-500' : ''}
        />
        {formErrors.short_description && (
          <p className="text-red-500 text-xs mt-1">{formErrors.short_description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción Completa *
        </label>
        <Textarea
          value={productForm.description}
          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          placeholder="Descripción detallada del producto"
          rows={4}
          className={formErrors.description ? 'border-red-500' : ''}
        />
        {formErrors.description && (
          <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría *
        </label>
        <Select
          value={productForm.category_id}
          onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}
        >
          <SelectTrigger className={formErrors.category_id ? 'border-red-500' : ''}>
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name || cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.category_id && (
          <p className="text-red-500 text-xs mt-1">{formErrors.category_id}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio *
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
            className={formErrors.price ? 'border-red-500' : ''}
          />
          {formErrors.price && (
            <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio con Descuento
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={productForm.discount_price || ''}
            onChange={(e) => setProductForm({
              ...productForm,
              discount_price: e.target.value ? parseFloat(e.target.value) : null,
            })}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moneda
          </label>
          <Select
            value={productForm.currency}
            onValueChange={(value) => setProductForm({ ...productForm, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NIO">NIO (Córdobas)</SelectItem>
              <SelectItem value="USD">USD (Dólares)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad en Stock
        </label>
        <Input
          type="number"
          min="0"
          value={productForm.stock_quantity}
          onChange={(e) => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={productForm.is_active}
            onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
            className="w-4 h-4 text-amber-700 rounded"
          />
          <span className="text-sm text-gray-700">Producto Activo</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={productForm.is_featured}
            onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
            className="w-4 h-4 text-amber-700 rounded"
          />
          <span className="text-sm text-gray-700">Producto Destacado</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del Producto
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="URL de la imagen (https://...)"
            className="flex-1"
          />
          <Button type="button" onClick={addImage} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {productForm.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {productForm.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">📦</text></svg>';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Panel
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
                <p className="text-sm text-gray-600">Administra tu catálogo de productos</p>
              </div>
            </div>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-amber-700 hover:bg-amber-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Crear Nuevo Producto
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProduct}>
                  {renderFormFields()}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setProductForm(initialProductForm);
                        setFormErrors({});
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-amber-700 hover:bg-amber-800"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Crear Producto
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} productos
            </div>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No se encontraron productos con esos criterios' : 'Comienza agregando tu primer producto'}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-700 hover:bg-amber-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Producto
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.category_id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded border overflow-hidden bg-gray-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {product.short_description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {category?.name || category?.nombre || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-bold text-amber-700">
                            {product.currency} {product.discount_price || product.price}
                          </p>
                          {product.discount_price && (
                            <p className="text-sm text-gray-400 line-through">
                              {product.currency} {product.price}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.stock_quantity > 10
                              ? 'bg-green-100 text-green-700'
                              : product.stock_quantity > 0
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openDeleteModal(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar Producto
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct}>
            {renderFormFields()}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  setProductForm(initialProductForm);
                  setFormErrors({});
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-amber-700 hover:bg-amber-800"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Eliminar Producto
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              ¿Estás seguro de que deseas eliminar el producto{' '}
              <span className="font-bold text-gray-900">{selectedProduct?.name}</span>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}