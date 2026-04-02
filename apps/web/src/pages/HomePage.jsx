import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await pb.collection('products').getFullList({
          filter: 'featured = true',
          sort: '-created',
          $autoCancel: false
        });
        setFeaturedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);
  const getProductImage = product => {
    if (product.image) {
      return pb.files.getUrl(product, product.image);
    }
    return 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop';
  };
  return <>
      <Helmet>
        <title>SAFARIA - Productos Premium para tus Mascotas</title>
        <meta name="description" content="Descubre nuestra selección de alimentos y productos de alta calidad para el bienestar de tus mascotas. ProPlan, Royal Canin y más marcas premium." />
      </Helmet>

      <Header />

      <main>
        <section className="relative min-h-[85dvh] flex items-center justify-center bg-cover bg-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1656360088457-86db3d21ff6f)',
        backgroundPosition: 'center 40%'
      }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <img src="https://horizons-cdn.hostinger.com/892254e3-6628-4103-98f3-0faab57f3fbf/155e6059bb04da3fd440d40284f3ed23.png" alt="SAFARIA" className="h-24 md:h-32 mx-auto mb-6" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{
            letterSpacing: '-0.02em'
          }}>
              Productos premium para tus mascotas
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              Alimentos de alta calidad, accesorios y cuidado especializado para el bienestar de tus compañeros peludos
            </p>
            
            <Link to="/catalog">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg transition-all duration-200 active:scale-[0.98]">
                Ver catálogo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 ring-2 ring-primary/10">
                <Sparkles className="h-4 w-4" />
                Productos destacados
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{
              letterSpacing: '-0.02em'
            }}>
                Lo mejor para tu mascota
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Selección premium de alimentos y productos para el cuidado óptimo de tus compañeros
              </p>
            </div>

            {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(6)].map((_, i) => <Card key={i} className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                  </Card>)}
              </div> : featuredProducts.length === 0 ? <div className="text-center py-16">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No hay productos destacados</h3>
                <p className="text-muted-foreground mb-6">Pronto agregaremos productos a esta sección</p>
                <Link to="/catalog">
                  <Button className="shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]">Ver todos los productos</Button>
                </Link>
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map(product => <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border-border/50 bg-card/80 backdrop-blur-sm">
                    <div className="aspect-square overflow-hidden bg-muted ring-1 ring-border/50 group-hover:ring-primary/20 transition-all duration-300">
                      <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="px-2 py-0.5 bg-muted rounded-md text-xs font-medium">SKU: {product.sku}</span>
                      </p>
                      <div className="mt-auto">
                        <p className="text-2xl font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Link to={`/product/${product.id}`} className="w-full">
                        <Button className="w-full transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg">
                          Ver detalles
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>)}
              </div>}

            {!loading && featuredProducts.length > 0 && <div className="text-center mt-12">
                <Link to="/catalog">
                  <Button variant="outline" size="lg" className="transition-all duration-200 active:scale-[0.98] border-2 hover:bg-muted/50 shadow-md hover:shadow-lg">
                    Ver todos los productos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>}
          </div>
        </section>

        <footer className="bg-[#F58220] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <img src="https://horizons-cdn.hostinger.com/892254e3-6628-4103-98f3-0faab57f3fbf/image_2026-03-27_203519273-sFx5y.png" alt="SAFARIA" className="h-16 mb-4" />
                <p className="text-sm text-white/80">
                  Productos premium para el bienestar de tus mascotas
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Enlaces rápidos</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/" className="text-white/80 hover:text-white transition-colors duration-200">Inicio</Link></li>
                  <li><Link to="/catalog" className="text-white/80 hover:text-white transition-colors duration-200">Catálogo</Link></li>
                  <li><Link to="/cart" className="text-white/80 hover:text-white transition-colors duration-200">Carrito</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><span className="text-white/80">Política de privacidad</span></li>
                  <li><span className="text-white/80">Términos de servicio</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
              <p>&copy; 2026 SAFARIA. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </main>
    </>;
};
export default HomePage;