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
const fs = require('fs');
// Intentar múltiples rutas posibles del build
const possibleBuildPaths = [
  path.join(__dirname, '..', 'web', 'dist'),
  path.join(__dirname, '..', '..', 'apps', 'web', 'dist'),
  path.join(process.cwd(), 'apps', 'web', 'dist'),
];
let buildPath = possibleBuildPaths[0];
for (const p of possibleBuildPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    buildPath = p;
    break;
  }
}
console.log('Build path:', buildPath);
console.log('index.html exists:', fs.existsSync(path.join(buildPath, 'index.html')));

app.use(express.static(buildPath));

// SPA fallback – cualquier ruta no-API retorna index.html
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Run npm run build first.');
  }
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
