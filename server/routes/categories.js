const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../db/index');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { active_only } = req.query;
    let sql = `SELECT * FROM categories WHERE 1=1`;
    if (active_only !== 'false') {
      sql += ` AND is_active = 1`;
    }
    sql += ` ORDER BY display_order ASC, name ASC`;

    const categories = await getAll(sql);
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// POST /api/categories - Admin add category
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, image_url, display_order, is_active } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await getOne(`SELECT * FROM categories WHERE slug = ?`, [slug]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with a similar name already exists.' });
    }

    const result = await runQuery(
      `INSERT INTO categories (name, slug, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?)`,
      [name, slug, image_url || '', display_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      categoryId: result.lastID
    });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// PUT /api/categories/:id - Admin update category
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const existing = await getOne(`SELECT * FROM categories WHERE id = ?`, [categoryId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { name, image_url, display_order, is_active } = req.body;
    let slug = existing.slug;

    if (name && name !== existing.name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await runQuery(
      `UPDATE categories SET name = ?, slug = ?, image_url = ?, display_order = ?, is_active = ? WHERE id = ?`,
      [
        name || existing.name,
        slug,
        image_url !== undefined ? image_url : existing.image_url,
        display_order !== undefined ? display_order : existing.display_order,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        categoryId
      ]
    );

    // Update category name in products table if changed
    if (name && name !== existing.name) {
      await runQuery(`UPDATE products SET category_name = ? WHERE category_id = ?`, [name, categoryId]);
    }

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id - Admin delete category
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const existing = await getOne(`SELECT * FROM categories WHERE id = ?`, [categoryId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Check dependent products
    const linkedProducts = await getAll(`SELECT id, name FROM products WHERE category_id = ? OR category_name = ?`, [categoryId, existing.name]);
    if (linkedProducts.length > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        success: false,
        warning: true,
        message: `Cannot delete category because ${linkedProducts.length} product(s) belong to it. Pass ?force=true to decouple products and delete.`
      });
    }

    // Decouple products if forced
    if (linkedProducts.length > 0) {
      await runQuery(`UPDATE products SET category_id = NULL, category_name = 'Other Products' WHERE category_id = ?`, [categoryId]);
    }

    await runQuery(`DELETE FROM categories WHERE id = ?`, [categoryId]);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

module.exports = router;
