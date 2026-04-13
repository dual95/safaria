import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  MapPin, Clock, Phone, ShoppingBag, Stethoscope, Scissors, Pill, Heart, ArrowRight, Dog, Cat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';

// ─── DATOS DE SUCURSALES ──────────────────────────────────────────────
const SUCURSALES = [
  {
    nombre: 'Santa Elena',
    direccion: 'Walmart Santa Elena, Antiguo Cuscatlán',
    horario: 'Lunes a Domingo · 8:00 am – 7:00 pm',
    telefono: '+503 7560-3155',
  },
  {
    nombre: 'Blvd. Ejército',
    direccion: 'Walmart Blvd. Ejército, Soyapango',
    horario: 'Lunes a Domingo · 8:00 am – 7:00 pm',
    telefono: '+503 7869-5782',
  },
  {
    nombre: 'Escalón',
    direccion: 'Walmart Escalón, San Salvador',
    horario: 'Lunes a Domingo · 8:00 am – 7:00 pm',
    telefono: '+503 7744-8509',
  },
  {
    nombre: 'Lomas',
    direccion: 'Urb. Lomas de San Francisco, Calle 1, Antiguo Cuscatlán',
    horario: 'Lunes a Sábado · 8:00 am – 7:00 pm',
    telefono: '+503 7844-4620',
  },
  {
    nombre: 'Constitución',
    direccion: 'Walmart Constitución, San Salvador',
    horario: 'Lunes a Domingo · 8:00 am – 7:00 pm',
    telefono: '+503 7842-9887',
  },
  {
    nombre: 'Zona Rosa',
    direccion: 'Blvd. Hipódromo, Oppen Plaza, San Salvador',
    horario: 'Lunes a Domingo · 8:00 am – 7:00 pm',
    telefono: '+503 7624-9411',
  },
];

const PRODUCTOS = [
  'Alimentos para perros',
  'Alimentos para gatos',
  'Alimentos para conejos',
  'Alimentos para tortugas',
  'Medicamentos veterinarios',
  'Vitaminas y suplementos',
  'Antipulgas y antigarrapatas',
  'Accesorios para mascotas',
];

const SERVICIOS = [
  {
    icon: Stethoscope,
    titulo: 'Consultas veterinarias',
    descripcion: 'Atención médica profesional para tu mascota con nuestros médicos veterinarios certificados.',
  },
  {
    icon: Pill,
    titulo: 'Vacunas y desparasitaciones',
    descripcion: 'Mantén al día el plan de vacunación y desparasitación de tu compañero.',
  },
  {
    icon: Scissors,
    titulo: 'Grooming',
    descripcion: 'Servicio de corte y baño para tu mascota. Pregúntanos por nuestros planes mensuales.', // TODO: confirmar si hay suscripción mensual
  },
  {
    icon: ShoppingBag,
    titulo: 'Farmacia veterinaria',
    descripcion: 'Amplio surtido de medicamentos, vitaminas y productos especializados para el cuidado de tu mascota.',
  },
];

const NosotrosPage = () => {
  return (
    <>
      <Helmet>
        <title>Nosotros - SAFARIA</title>
        <meta
          name="description"
          content="Conoce SAFARIA: tienda para mascotas, farmacia y consultorio veterinario con 6 sucursales en El Salvador."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">

        {/* ── HERO ── */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 ring-2 ring-primary/10">
              <Heart className="h-4 w-4" />
              Nuestra historia
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
              Más que una tienda,<br />somos tu aliado veterinario
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {/* TODO: Reemplazar con la historia real de SAFARIA */}
              En SAFARIA nos dedicamos al bienestar de tus mascotas desde hace años. Somos una tienda especializada para mascotas,
              farmacia veterinaria y consultorio veterinario, todo bajo un mismo techo. Nuestro compromiso es brindarte
              los mejores productos y servicios para que tu compañero viva feliz y saludable.
            </p>
          </div>
        </section>

        {/* ── QUÉ SOMOS ── */}
        <section className="py-16 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                Todo lo que tu mascota necesita
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Atendemos a perros, gatos, conejos, tortugas y más.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICIOS.map((servicio) => {
                const Icon = servicio.icon;
                return (
                  <Card key={servicio.titulo} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4 ring-2 ring-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{servicio.titulo}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{servicio.descripcion}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PRODUCTOS ── */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 ring-2 ring-primary/10">
                  <ShoppingBag className="h-4 w-4" />
                  Nuestros productos
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
                  Todo para el cuidado de tu mascota
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Contamos con una amplia selección de productos de las mejores marcas para mantener a tu mascota sana, feliz y bien alimentada.
                </p>
                <Link to="/catalog">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]">
                    Ver catálogo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PRODUCTOS.map((producto) => (
                  <div
                    key={producto}
                    className="flex items-center gap-3 p-4 bg-card/80 rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{producto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SUCURSALES ── */}
        <section className="py-16 px-4 bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 ring-2 ring-primary/10">
                <MapPin className="h-4 w-4" />
                Nuestras sucursales
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                6 sucursales a tu disposición
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Encuéntranos en distintas zonas de El Salvador. Estamos cerca de ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUCURSALES.map((sucursal) => (
                <Card key={sucursal.nombre} className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 border-b border-border/50">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                      {sucursal.nombre}
                    </h3>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {sucursal.direccion}
                    </p>
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{sucursal.horario}</span>
                    </div>
                    {sucursal.telefono ? (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                        <a href={`tel:${sucursal.telefono}`} className="hover:text-primary transition-colors">
                          {sucursal.telefono}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground/50">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>Teléfono próximamente</span> {/* TODO: agregar teléfono */}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default NosotrosPage;
