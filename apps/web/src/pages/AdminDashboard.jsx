
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Package, ShoppingBag, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const ordersList = await pb.collection('orders').getList(1, 50, {
        sort: '-created',
        $autoCancel: false
      });
      setOrders(ordersList.items);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const productsList = await pb.collection('products').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await pb.collection('orders').update(orderId, { status: newStatus }, { $autoCancel: false });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Estado de orden actualizado');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar orden');
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await pb.collection('products').delete(productId, { $autoCancel: false });
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Producto eliminado');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-secondary text-secondary-foreground',
      'Procesando': 'bg-primary/20 text-primary',
      'Enviado': 'bg-accent/20 text-accent',
      'Entregado': 'bg-primary text-primary-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const lowStockProducts = products.filter(p => p.stock < 20).length;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - SAFARIA</title>
        <meta name="description" content="Panel de administración para gestionar productos y órdenes de SAFARIA." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8" style={{letterSpacing: '-0.02em'}}>
            Panel de administración
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total órdenes</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{orders.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos totales</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Stock bajo</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{lowStockProducts}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Órdenes</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de órdenes</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay órdenes registradas</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                              <TableCell>{order.customer_name}</TableCell>
                              <TableCell>{new Date(order.created).toLocaleDateString('es-ES')}</TableCell>
                              <TableCell className="font-semibold text-primary">${order.total.toFixed(2)}</TableCell>
                              <TableCell>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                                >
                                  <SelectTrigger className={`w-32 ${getStatusColor(order.status)}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="Procesando">Procesando</SelectItem>
                                    <SelectItem value="Enviado">Enviado</SelectItem>
                                    <SelectItem value="Entregado">Entregado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setSelectedOrder(order)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Detalles de la orden</DialogTitle>
                                    </DialogHeader>
                                    {selectedOrder && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <p className="text-muted-foreground">Cliente</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.customer_name}</p>
                                          </div>
                                          <div>
                                            <p className="text-muted-foreground">Email</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.customer_email}</p>
                                          </div>
                                          <div>
                                            <p className="text-muted-foreground">Teléfono</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.customer_phone}</p>
                                          </div>
                                          <div>
                                            <p className="text-muted-foreground">Ciudad</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.customer_city}</p>
                                          </div>
                                          <div className="col-span-2">
                                            <p className="text-muted-foreground">Dirección</p>
                                            <p className="font-semibold text-foreground">{selectedOrder.customer_address}</p>
                                          </div>
                                        </div>

                                        <div>
                                          <h3 className="font-semibold text-foreground mb-3">Productos</h3>
                                          <div className="space-y-2">
                                            {selectedOrder.items.map((item, idx) => (
                                              <div key={idx} className="flex justify-between text-sm bg-muted p-3 rounded-lg">
                                                <span className="text-foreground">{item.name} x{item.quantity}</span>
                                                <span className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="border-t border-border pt-4">
                                          <div className="flex justify-between text-lg font-bold">
                                            <span className="text-foreground">Total</span>
                                            <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de productos</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay productos registrados</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                              <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                              <TableCell>{product.category || '-'}</TableCell>
                              <TableCell className="font-semibold text-primary">${product.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <span className={product.stock < 20 ? 'text-accent font-semibold' : 'text-foreground'}>
                                  {product.stock}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteProduct(product.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
