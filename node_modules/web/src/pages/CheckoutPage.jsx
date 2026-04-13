
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_city: '',
    customer_zip: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('safaria_cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
    }
    setCartItems(cart);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email inválido';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'El teléfono es requerido';
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = 'La dirección es requerida';
    }

    if (!formData.customer_city.trim()) {
      newErrors.customer_city = 'La ciudad es requerida';
    }

    if (!formData.customer_zip.trim()) {
      newErrors.customer_zip = 'El código postal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.12;
      const total = subtotal + tax;

      const orderData = {
        ...formData,
        items: cartItems,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'Pendiente'
      };

      const order = await pb.collection('orders').create(orderData, { $autoCancel: false });

      localStorage.removeItem('safaria_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      setOrderId(order.id);
      setOrderComplete(true);
      toast.success('Orden creada exitosamente');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al procesar la orden. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  if (orderComplete) {
    return (
      <>
        <Helmet>
          <title>Orden confirmada - SAFARIA</title>
        </Helmet>

        <Header />

        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/10">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4" style={{letterSpacing: '-0.02em'}}>
                  Orden confirmada
                </h1>
                <p className="text-lg text-muted-foreground mb-2">
                  Tu orden ha sido recibida exitosamente
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Número de orden: <span className="font-mono font-semibold text-foreground">{orderId}</span>
                </p>

              <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-6 mb-8 text-left border border-border/50">
                <h2 className="font-semibold text-foreground mb-4 text-lg">Detalles de la orden</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA (12%)</span>
                    <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-primary text-xl">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Recibirás un email de confirmación en {formData.customer_email}
              </p>

              <Button onClick={() => navigate('/')} className="transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl">
                Volver al inicio
              </Button>
              </div>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - SAFARIA</title>
        <meta name="description" content="Completa tu compra en SAFARIA. Ingresa tus datos de envío y confirma tu orden." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8" style={{letterSpacing: '-0.02em'}}>
            Finalizar compra
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Información de envío</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="customer_name">Nombre completo *</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className="text-foreground"
                      />
                      {errors.customer_name && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_email">Email *</Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleChange}
                        className="text-foreground"
                      />
                      {errors.customer_email && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_phone">Teléfono *</Label>
                      <Input
                        id="customer_phone"
                        name="customer_phone"
                        value={formData.customer_phone}
                        onChange={handleChange}
                        className="text-foreground"
                      />
                      {errors.customer_phone && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_address">Dirección *</Label>
                      <Input
                        id="customer_address"
                        name="customer_address"
                        value={formData.customer_address}
                        onChange={handleChange}
                        className="text-foreground"
                      />
                      {errors.customer_address && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer_city">Ciudad *</Label>
                        <Input
                          id="customer_city"
                          name="customer_city"
                          value={formData.customer_city}
                          onChange={handleChange}
                          className="text-foreground"
                        />
                        {errors.customer_city && (
                          <p className="text-sm text-destructive mt-1">{errors.customer_city}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customer_zip">Código postal *</Label>
                        <Input
                          id="customer_zip"
                          name="customer_zip"
                          value={formData.customer_zip}
                          onChange={handleChange}
                          className="text-foreground"
                        />
                        {errors.customer_zip && (
                          <p className="text-sm text-destructive mt-1">{errors.customer_zip}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl text-base font-semibold py-6"
                    >
                      {loading ? 'Procesando...' : 'Confirmar orden'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Resumen del pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-semibold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <div className="flex justify-between text-foreground items-center py-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-foreground items-center py-2">
                      <span className="text-muted-foreground">IVA (12%)</span>
                      <span className="font-bold">${tax.toFixed(2)}</span>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-foreground">Total</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">${total.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground mt-1">IVA incluido</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CheckoutPage;
