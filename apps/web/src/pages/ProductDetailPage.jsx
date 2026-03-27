
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const productData = await pb.collection('products').getOne(id, { $autoCancel: false });
      setProduct(productData);

      if (productData.category) {
        const related = await pb.collection('products').getFullList({
          filter: `category = "${productData.category}" && id != "${id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setRelatedProducts(related.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('No se pudo cargar el producto');
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (prod) => {
    if (prod.image) {
      return pb.files.getUrl(prod, prod.image);
    }
    return 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop';
  };

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('safaria_cart') || '[]');
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        sku: product.sku
      });
    }

    localStorage.setItem('safaria_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.name} agregado al carrito`);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) return null;

  return (
    <>
      <Helmet>
        <title>{`${product.name} - SAFARIA`}</title>
        <meta name="description" content={product.description || `Compra ${product.name} en SAFARIA. Productos premium para tus mascotas.`} />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/catalog">
            <Button variant="ghost" className="mb-8 transition-all duration-200 active:scale-[0.98]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al catálogo
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img 
                src={getProductImage(product)} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{letterSpacing: '-0.02em'}}>
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                    <Package className="h-4 w-4" />
                    {product.stock} en stock
                  </span>
                ) : (
                  <span className="text-sm text-destructive font-medium">Agotado</span>
                )}
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {product.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Descripción</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.category && (
                <div className="mb-8">
                  <span className="inline-block bg-muted text-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              )}

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Cantidad:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="transition-all duration-200 active:scale-[0.98]"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-foreground">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="transition-all duration-200 active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="w-full transition-all duration-200 active:scale-[0.98]"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Agregar al carrito
                </Button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8" style={{letterSpacing: '-0.02em'}}>
                Productos relacionados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img 
                          src={getProductImage(relatedProduct)} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-xl font-bold text-primary">
                          ${relatedProduct.price.toFixed(2)}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default ProductDetailPage;
