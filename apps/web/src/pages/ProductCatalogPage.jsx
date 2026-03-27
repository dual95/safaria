
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, selectedCategories, selectedBrands]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let filter = '';
      const filters = [];

      if (searchQuery) {
        filters.push(`(name ~ "${searchQuery}" || sku ~ "${searchQuery}" || description ~ "${searchQuery}")`);
      }

      if (selectedCategories.length > 0) {
        const categoryFilter = selectedCategories.map(cat => `category = "${cat}"`).join(' || ');
        filters.push(`(${categoryFilter})`);
      }

      if (selectedBrands.length > 0) {
        const brandFilter = selectedBrands.map(brand => `brand = "${brand}"`).join(' || ');
        filters.push(`(${brandFilter})`);
      }

      if (filters.length > 0) {
        filter = filters.join(' && ');
      }

      const result = await pb.collection('products').getList(page, perPage, {
        filter: filter || undefined,
        sort: '-created',
        $autoCancel: false
      });

      setProducts(result.items);
      setTotalPages(result.totalPages);

      const allProducts = await pb.collection('products').getFullList({ $autoCancel: false });
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      const uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.image) {
      return pb.files.getUrl(product, product.image);
    }
    return 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop';
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery('');
    setPage(1);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Categorías</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label
                htmlFor={`cat-${category}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-3">Marcas</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Catálogo de productos - SAFARIA</title>
        <meta name="description" content="Explora nuestro catálogo completo de alimentos y productos para mascotas. Encuentra lo mejor para tu compañero peludo." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{letterSpacing: '-0.02em'}}>
              Catálogo de productos
            </h1>
            <p className="text-lg text-muted-foreground">
              Descubre nuestra selección completa de productos premium
            </p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 text-foreground"
              />
            </div>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-card rounded-xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Filtros</h2>
                <FilterSidebar />
              </div>
            </aside>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-8 w-1/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron productos</h3>
                  <p className="text-muted-foreground mb-6">Intenta ajustar tus filtros o búsqueda</p>
                  <Button onClick={clearFilters}>Limpiar filtros</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-full">
                        <div className="aspect-square overflow-hidden bg-muted">
                          <img 
                            src={getProductImage(product)} 
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            SKU: {product.sku}
                          </p>
                          {product.stock > 0 ? (
                            <p className="text-xs text-primary mb-3">
                              En stock: {product.stock} unidades
                            </p>
                          ) : (
                            <p className="text-xs text-destructive mb-3">
                              Agotado
                            </p>
                          )}
                          <div className="mt-auto">
                            <p className="text-2xl font-bold text-primary">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Link to={`/product/${product.id}`} className="w-full">
                            <Button className="w-full transition-all duration-200 active:scale-[0.98]">
                              Ver detalles
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-2 px-4">
                        <span className="text-sm text-muted-foreground">
                          Página {page} de {totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProductCatalogPage;
