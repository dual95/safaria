const express    = require('express');
const router     = express.Router();
const pool       = require('../db');
const requireAuth = require('../middleware/authMiddleware');

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 15 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/orders   (requiere auth admin)
// Query params: page, perPage, sort
// ─────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const page    = Math.max(1, parseInt(req.query.page)     || 1);
    const perPage = Math.min(100, parseInt(req.query.perPage) || 50);
    const offset  = (page - 1) * perPage;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM orders');
    const [rows] = await pool.query(
      'SELECT * FROM orders ORDER BY created DESC LIMIT ? OFFSET ?',
      [perPage, offset]
    );

    // items field es JSON en MySQL — parsearlo si viene como string
    const items = rows.map(row => ({
      ...row,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    }));

    res.json({ items, totalItems: total, totalPages: Math.ceil(total / perPage) });
  } catch (err) {
    console.error('GET /orders:', err);
    res.status(500).json({ message: 'Error al obtener órdenes' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/orders  (público — cualquier cliente puede crear una orden)
// ─────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      customer_name, customer_email, customer_phone,
      customer_address, customer_city, customer_zip,
      items, subtotal, tax, total, status = 'Pendiente'
    } = req.body;

    // Validación básica
    if (!customer_name || !customer_email || !items) {
      return res.status(400).json({ message: 'Datos obligatorios faltantes' });
    }

    const id  = generateId();
    const now = new Date();

    await pool.query(
      `INSERT INTO orders
       (id, customer_name, customer_email, customer_phone, customer_address,
        customer_city, customer_zip, items, subtotal, tax, total, status, created_date, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, customer_name, customer_email, customer_phone, customer_address,
        customer_city, customer_zip, JSON.stringify(items),
        subtotal, tax, total, status, now, now, now
      ]
    );

    res.status(201).json({ id, status });
  } catch (err) {
    console.error('POST /orders:', err);
    res.status(500).json({ message: 'Error al crear la orden' });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id  (requiere auth admin)
// Body: { status }
// ─────────────────────────────────────────────────────────────────────────
const VALID_STATUSES = ['Pendiente', 'Procesando', 'Enviado', 'Entregado'];

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const [result] = await pool.query(
      'UPDATE orders SET status = ?, updated = NOW() WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Orden no encontrada' });

    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error('PATCH /orders/:id:', err);
    res.status(500).json({ message: 'Error al actualizar orden' });
  }
});

module.exports = router;
