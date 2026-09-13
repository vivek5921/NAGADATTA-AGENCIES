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
      sql += ` AND is_active = true`;
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
    const { name, image_url, display_order, is_active, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    let baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!baseSlug) baseSlug = 'cat-' + Date.now();

    let slug = baseSlug;
    let count = 1;
    while (await getOne(`SELECT id FROM categories WHERE slug = ?`, [slug])) {
      slug = `${baseSlug}-${count++}`;
    }

    const order = display_order !== undefined && display_order !== null && !isNaN(parseInt(display_order, 10))
      ? parseInt(display_order, 10)
      : 0;

    const result = await runQuery(
      `INSERT INTO categories (name, slug, image_url, display_order, is_active, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, image_url || '', order, is_active !== undefined ? Boolean(is_active) : true, description || '']
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      categoryId: result.lastID
    });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, message: 'Failed to create category: ' + (err.message || 'Database error') });
  }
});

// PUT /api/categories/:id - Admin update category
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID.' });
    }

    const existing = await getOne(`SELECT * FROM categories WHERE id = ?`, [categoryId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const { name, image_url, display_order, is_active, description } = req.body;
    let slug = existing.slug;

    if (name && name.trim() !== existing.name) {
      let baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!baseSlug) baseSlug = 'cat-' + Date.now();
      slug = baseSlug;
      let count = 1;
      while (await getOne(`SELECT id FROM categories WHERE slug = ? AND id != ?`, [slug, categoryId])) {
        slug = `${baseSlug}-${count++}`;
      }
    }

    const order = display_order !== undefined && display_order !== null && !isNaN(parseInt(display_order, 10))
      ? parseInt(display_order, 10)
      : existing.display_order || 0;

    const active = is_active !== undefined ? Boolean(is_active) : Boolean(existing.is_active);

    await runQuery(
      `UPDATE categories SET 
        name = ?, 
        slug = ?, 
        image_url = ?, 
        display_order = ?, 
        is_active = ?,
        description = ?
       WHERE id = ?`,
      [
        name ? name.trim() : existing.name,
        slug,
        image_url !== undefined ? image_url : existing.image_url,
        order,
        active,
        description !== undefined ? description : existing.description,
        categoryId
      ]
    );

    // Update category name in products table if changed
    if (name && name.trim() !== existing.name) {
      await runQuery(`UPDATE products SET category_name = ? WHERE category_id = ?`, [name.trim(), categoryId]);
    }

    res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Failed to update category: ' + (err.message || 'Database error') });
  }
});

// DELETE /api/categories/:id - Admin delete category
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID.' });
    }

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
    res.status(500).json({ success: false, message: 'Failed to delete category: ' + (err.message || 'Database error') });
  }
});

module.exports = router;
