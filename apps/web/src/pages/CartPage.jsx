
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
        <main className="min-h-screen bg-background py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
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

      <main className="min-h-screen bg-background py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8" style={{letterSpacing: '-0.02em'}}>
            Carrito de compras
          </h1>

          {cartItems.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Tu carrito está vacío</h2>
                <p className="text-muted-foreground mb-6">Agrega productos para comenzar tu compra</p>
                <Link to="/catalog">
                  <Button className="transition-all duration-200 active:scale-[0.98]">
                    Ver catálogo
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.productId}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={getProductImage(item)} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.productId}`}>
                            <h3 className="font-semibold text-foreground hover:text-primary transition-colors duration-200 line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            SKU: {item.sku}
                          </p>
                          <p className="text-lg font-bold text-primary mt-2">
                            ${(item.currentPrice || item.price).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-[0.98]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 transition-all duration-200 active:scale-[0.98]"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-foreground">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= 99}
                              className="h-8 w-8 transition-all duration-200 active:scale-[0.98]"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Resumen del pedido</h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-foreground">
                        <span>Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-foreground">
                        <span>IVA (12%)</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-lg font-bold text-foreground">
                          <span>Total</span>
                          <span className="text-primary">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        onClick={() => navigate('/checkout')}
                        className="w-full transition-all duration-200 active:scale-[0.98]"
                      >
                        Proceder al pago
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Link to="/catalog">
                        <Button variant="outline" size="lg" className="w-full transition-all duration-200 active:scale-[0.98]">
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
