const express = require('express');
const router = express.Router();
const pool   = require('../db');

// Columnas permitidas para ORDER BY (previene SQL injection)
const SORT_COLUMNS = { created: 'created', updated: 'updated', name: 'name', price: 'price', sku: 'sku' };

function parseSort(sort = '-created') {
  const dir = sort.startsWith('-') ? 'DESC' : 'ASC';
  const col = SORT_COLUMNS[sort.replace('-', '')] || 'created';
  return `${col} ${dir}`;
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/products
// Query params: page, perPage, search, categories, brands, priceMin, priceMax, sort
// ─────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)    || 1);
    const perPage   = Math.min(100, parseInt(req.query.perPage) || 12);
    const offset    = (page - 1) * perPage;
    const { search, categories, brands, priceMin, priceMax, sort } = req.query;

    const conditions = [];
    const params     = [];

    // Búsqueda por texto
    if (search) {
      conditions.push('(name LIKE ? OR sku LIKE ? OR description LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    // Filtro por categorías (comma-separated)
    if (categories) {
      const cats = categories.split(',').filter(Boolean);
      if (cats.length) {
        conditions.push(`category IN (${cats.map(() => '?').join(',')})`);
        params.push(...cats);
      }
    }

    // Filtro por marcas (comma-separated)
    if (brands) {
      const brs = brands.split(',').filter(Boolean);
      if (brs.length) {
        conditions.push(`brand IN (${brs.map(() => '?').join(',')})`);
        params.push(...brs);
      }
    }

    // Filtro de precio
    if (priceMin !== undefined) { conditions.push('price >= ?'); params.push(parseFloat(priceMin)); }
    if (priceMax !== undefined) { conditions.push('price <= ?'); params.push(parseFloat(priceMax)); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const order = parseSort(sort);

    // Total de registros para paginación
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM products ${where}`, params
    );

    // Registros paginados
    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    res.json({
      items:      rows,
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
      page,
      perPage,
    });
  } catch (err) {
    console.error('GET /products:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/products/all
// Retorna todos los productos sin paginar.
// Query params: sort, featured, category, excludeId
// ─────────────────────────────────────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const { sort, featured, category, excludeId } = req.query;
    const conditions = [];
    const params     = [];

    if (featured === 'true') { conditions.push('featured = 1'); }
    if (category)            { conditions.push('category = ?');  params.push(category); }
    if (excludeId)           { conditions.push('id != ?');        params.push(excludeId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const order = parseSort(sort);

    const [rows] = await pool.query(
      `SELECT * FROM products ${where} ORDER BY ${order}`, params
    );

    res.json(rows);
  } catch (err) {
    console.error('GET /products/all:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error('GET /products/:id:', err);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/products/:id  (requiere autenticación admin)
// ─────────────────────────────────────────────────────────────────────────
const requireAuth = require('../middleware/authMiddleware');

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('DELETE /products/:id:', err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
