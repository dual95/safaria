
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
import { Slider } from '@/components/ui/slider';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 12;

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, selectedCategories, selectedBrands, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await pb.collection('products').getList(page, perPage, {
        sort: '-created',
        _params: {
          search:     searchQuery || undefined,
          categories: selectedCategories.length ? selectedCategories.join(',') : undefined,
          brands:     selectedBrands.length     ? selectedBrands.join(',')     : undefined,
          priceMin:   priceRange[0],
          priceMax:   priceRange[1],
        },
      });

      setProducts(result.items);
      setTotalPages(result.totalPages);

      const allProducts = await pb.collection('products').getFullList({ $autoCancel: false });
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      const uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
      setCategories(uniqueCategories);
      setBrands(uniqueBrands);
      
      // Calcular el precio máximo
      const prices = allProducts.map(p => p.price);
      const max = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 500;
      setMaxPrice(max);
      
      // Actualizar el rango si el máximo actual es menor que el nuevo máximo
      if (priceRange[1] === 500 && max > 500) {
        setPriceRange([0, max]);
      }
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
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
    setPage(1);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Precio</h3>
        <div className="space-y-4">
          <div className="px-2 py-4">
            <Slider
              defaultValue={priceRange}
              key={`${priceRange[0]}-${priceRange[1]}`}
              onValueCommit={(value) => {
                setPriceRange(value);
                setPage(1);
              }}
              max={maxPrice}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
            <span>${priceRange[0]} - ${priceRange[1]} USD</span>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div 
              onClick={() => {
                setPriceRange([0, 10]);
                setPage(1);
              }}
              className="cursor-pointer hover:text-foreground transition-colors py-1"
            >
              De 0 a 10 USD
            </div>
            <div 
              onClick={() => {
                setPriceRange([10, 15]);
                setPage(1);
              }}
              className="cursor-pointer hover:text-foreground transition-colors py-1"
            >
              De 10 a 15 USD
            </div>
            <div 
              onClick={() => {
                setPriceRange([15, 20]);
                setPage(1);
              }}
              className="cursor-pointer hover:text-foreground transition-colors py-1"
            >
              De 15 a 20 USD
            </div>
            <div 
              onClick={() => {
                setPriceRange([20, 30]);
                setPage(1);
              }}
              className="cursor-pointer hover:text-foreground transition-colors py-1"
            >
              De 20 a 30 USD
            </div>
            <div 
              onClick={() => {
                setPriceRange([30, maxPrice]);
                setPage(1);
              }}
              className="cursor-pointer hover:text-foreground transition-colors py-1"
            >
              Más de 30 USD
            </div>
          </div>
        </div>
      </div>

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

      {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
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

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
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
              <div className="sticky top-24 bg-card/80 backdrop-blur-sm rounded-xl p-6 border-2 border-border/50 shadow-lg">
                <h2 className="text-lg font-semibold text-foreground mb-4">Filtros</h2>
                <FilterSidebar />
              </div>
            </aside>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
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
                <Card className="border-2 border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
                      <Search className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron productos</h3>
                    <p className="text-muted-foreground mb-6">Intenta ajustar tus filtros o búsqueda</p>
                    <Button onClick={clearFilters} className="shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]">Limpiar filtros</Button>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border-border/50 bg-card/80 backdrop-blur-sm">
                        <div className="aspect-square overflow-hidden bg-muted ring-1 ring-border/50 group-hover:ring-primary/20 transition-all duration-300">
                          <img 
                            src={getProductImage(product)} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
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
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-2 px-4">
                        <span className="text-sm font-medium text-foreground">
                          Página {page} de {totalPages}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
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
