const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../db/index');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/spare-parts - Public list & search
router.get('/', async (req, res) => {
  try {
    const { category, search, availability, active_only } = req.query;
    let sql = `SELECT * FROM spare_parts WHERE 1=1`;
    const params = [];

    if (active_only !== 'false') {
      sql += ` AND is_active = true`;
    }

    if (category && category !== 'all') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (availability && availability !== 'all') {
      sql += ` AND availability = ?`;
      params.push(availability);
    }

    if (search) {
      const q = `%${search.trim()}%`;
      sql += ` AND (name LIKE ? OR category LIKE ? OR compatible_with LIKE ? OR model_number LIKE ? OR description LIKE ?)`;
      params.push(q, q, q, q, q);
    }

    sql += ` ORDER BY id DESC`;

    const spareParts = await getAll(sql, params);
    res.json({ success: true, count: spareParts.length, spareParts });
  } catch (err) {
    console.error('Error fetching spare parts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch spare parts.' });
  }
});

// POST /api/spare-parts - Admin add spare part
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, category, image_url, compatible_with, model_number, availability, description, is_active } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and Category are required.' });
    }

    const result = await runQuery(
      `INSERT INTO spare_parts (name, category, image_url, compatible_with, model_number, availability, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category,
        image_url || '',
        compatible_with || '',
        model_number || '',
        availability || 'available',
        description || '',
        is_active !== undefined ? Boolean(is_active) : true
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Spare part added successfully.',
      sparePartId: result.lastID
    });
  } catch (err) {
    console.error('Error adding spare part:', err);
    res.status(500).json({ success: false, message: 'Failed to add spare part.' });
  }
});

// PUT /api/spare-parts/:id - Admin update spare part
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await getOne(`SELECT * FROM spare_parts WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }

    const { name, category, image_url, compatible_with, model_number, availability, description, is_active } = req.body;

    await runQuery(
      `UPDATE spare_parts SET
        name = ?,
        category = ?,
        image_url = ?,
        compatible_with = ?,
        model_number = ?,
        availability = ?,
        description = ?,
        is_active = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : existing.name,
        category !== undefined ? category : existing.category,
        image_url !== undefined ? image_url : existing.image_url,
        compatible_with !== undefined ? compatible_with : existing.compatible_with,
        model_number !== undefined ? model_number : existing.model_number,
        availability !== undefined ? availability : existing.availability,
        description !== undefined ? description : existing.description,
        is_active !== undefined ? Boolean(is_active) : Boolean(existing.is_active),
        id
      ]
    );

    res.json({ success: true, message: 'Spare part updated successfully.' });
  } catch (err) {
    console.error('Error updating spare part:', err);
    res.status(500).json({ success: false, message: 'Failed to update spare part.' });
  }
});

// DELETE /api/spare-parts/:id - Admin delete spare part
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await getOne(`SELECT * FROM spare_parts WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Spare part not found.' });
    }

    await runQuery(`DELETE FROM spare_parts WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Spare part deleted successfully.' });
  } catch (err) {
    console.error('Error deleting spare part:', err);
    res.status(500).json({ success: false, message: 'Failed to delete spare part.' });
  }
});

module.exports = router;
