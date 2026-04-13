
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
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
          sort: '-created',
          _params: { category: productData.category, excludeId: id },
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

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/catalog">
            <Button variant="ghost" className="mb-8 transition-all duration-200 active:scale-[0.98] hover:bg-muted/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al catálogo
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted ring-2 ring-border/50 shadow-xl">
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
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium text-muted-foreground">SKU: {product.sku}</span>
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
                  <span className="inline-block bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-4 py-2 rounded-full text-sm font-medium ring-2 ring-primary/10">
                    {product.category}
                  </span>
                </div>
              )}

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Cantidad:</span>
                  <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1 border border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="h-9 w-9 rounded-full hover:bg-background transition-all duration-200 active:scale-[0.95]"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-foreground text-lg">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= 99}
                      className="h-9 w-9 rounded-full hover:bg-background transition-all duration-200 active:scale-[0.95]"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={addToCart}
                  className="w-full transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl text-base font-semibold py-6"
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
                  <Card key={relatedProduct.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <div className="aspect-square overflow-hidden bg-muted ring-1 ring-border/50 group-hover:ring-primary/20 transition-all duration-300">
                        <img 
                          src={getProductImage(relatedProduct)} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
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
