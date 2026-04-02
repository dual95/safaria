
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const cart = JSON.parse(localStorage.getItem('safaria_cart') || '[]');
      
      const itemsWithDetails = await Promise.all(
        cart.map(async (item) => {
          try {
            const product = await pb.collection('products').getOne(item.productId, { $autoCancel: false });
            return {
              ...item,
              currentPrice: product.price,
              currentStock: product.stock,
              image: product.image,
              product: product // Guardar el objeto completo del producto
            };
          } catch (error) {
            return item;
          }
        })
      );

      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (updatedItems) => {
    localStorage.setItem('safaria_cart', JSON.stringify(updatedItems));
    setCartItems(updatedItems);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cartItems.find(i => i.productId === productId);
    if (item && newQuantity > item.currentStock) {
      toast.error('Cantidad máxima alcanzada');
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    );
    updateCart(updatedItems);
  };

  const removeItem = (productId) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    updateCart(updatedItems);
    toast.success('Producto eliminado del carrito');
  };

  const getProductImage = (item) => {
    if (item.product && item.product.image) {
      return pb.files.getUrl(item.product, item.product.image);
    }
    return 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.currentPrice || item.price) * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="h-10 bg-muted/50 rounded-lg w-64 mb-3 animate-pulse"></div>
              <div className="h-5 bg-muted/50 rounded w-48 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-border/50">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-28 h-28 bg-muted/50 rounded-xl"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-6 bg-muted/50 rounded w-3/4"></div>
                          <div className="h-4 bg-muted/50 rounded w-1/4"></div>
                          <div className="h-8 bg-muted/50 rounded w-1/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card className="border-2 border-border/50">
                  <div className="p-6 space-y-4 animate-pulse">
                    <div className="h-8 bg-muted/50 rounded w-1/2"></div>
                    <div className="h-6 bg-muted/50 rounded"></div>
                    <div className="h-6 bg-muted/50 rounded"></div>
                    <div className="h-12 bg-muted/50 rounded"></div>
                    <div className="h-14 bg-muted/50 rounded"></div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Carrito de compras - SAFARIA</title>
        <meta name="description" content="Revisa tu carrito de compras y procede al pago de tus productos SAFARIA." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{letterSpacing: '-0.02em'}}>
              Carrito de compras
            </h1>
            <p className="text-muted-foreground">
              {cartItems.length > 0 ? `${cartItems.length} ${cartItems.length === 1 ? 'producto' : 'productos'} en tu carrito` : 'Tu carrito está vacío'}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <Card className="border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
                  <ShoppingCart className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Tu carrito está vacío</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Descubre nuestros productos y comienza a crear tu pedido perfecto
                </p>
                <Link to="/catalog">
                  <Button size="lg" className="transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl">
                    Explorar productos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.productId} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border/50 group-hover:ring-primary/20 transition-all duration-300">
                          <img 
                            src={getProductImage(item)} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.productId}`}>
                            <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-muted rounded-md text-xs font-medium">
                              SKU: {item.sku}
                            </span>
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-primary">
                              ${(item.currentPrice || item.price).toFixed(2)}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              c/u
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-[0.95] rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1 border border-border/50">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-9 w-9 rounded-full hover:bg-background transition-all duration-200 active:scale-[0.95]"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-12 text-center font-bold text-foreground text-lg">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= 99}
                              className="h-9 w-9 rounded-full hover:bg-background transition-all duration-200 active:scale-[0.95]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24 overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                      Resumen
                    </h2>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-foreground items-center py-3 border-b border-dashed border-border/50">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-foreground items-center py-3 border-b border-dashed border-border/50">
                        <span className="text-muted-foreground">IVA (12%)</span>
                        <span className="font-bold text-lg">${tax.toFixed(2)}</span>
                      </div>
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 mt-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-foreground">Total</span>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-primary">
                              ${total.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              IVA incluido
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        onClick={() => navigate('/checkout')}
                        className="w-full transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl text-base font-semibold py-6"
                      >
                        Proceder al pago
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Link to="/catalog">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full transition-all duration-200 active:scale-[0.98] border-2 hover:bg-muted/50"
                        >
                          Continuar comprando
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CartPage;
