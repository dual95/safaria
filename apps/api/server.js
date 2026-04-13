require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Archivos subidos (imágenes de productos) ────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rutas API ───────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));

// ── Servir React build (producción) ─────────────────────────────────────
const buildPath = path.join(__dirname, '..', '..', 'dist', 'apps', 'web');
app.use(express.static(buildPath));

// SPA fallback – cualquier ruta no-API retorna index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// ── Manejo de errores global ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// ── Iniciar servidor ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Safaria API corriendo en puerto ${PORT}`);
});
