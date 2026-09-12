const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery } = require('../db/index');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/products - Public product catalogue listing
router.get('/', async (req, res) => {
  try {
    const { category, search, availability, most_selling, active_only } = req.query;

    let sql = `SELECT * FROM products WHERE 1=1`;
    const params = [];

    // By default, customer view shows active products only
    if (active_only !== 'false') {
      sql += ` AND is_active = true`;
    }

    if (category && category !== 'all') {
      sql += ` AND (category_name = ? OR category_id = ?)`;
      params.push(category, category);
    }

    if (availability && availability !== 'all') {
      sql += ` AND availability = ?`;
      params.push(availability);
    }

    if (most_selling === 'true' || most_selling === '1') {
      sql += ` AND is_most_selling = true`;
    }

    if (search) {
      const q = `%${search.trim()}%`;
      sql += ` AND (name LIKE ? OR brand LIKE ? OR category_name LIKE ? OR model_number LIKE ? OR description LIKE ?)`;
      params.push(q, q, q, q, q);
    }

    sql += ` ORDER BY id DESC`;

    const products = await getAll(sql, params);

    // Parse JSON features & specifications safely
    const formatted = products.map(p => ({
      ...p,
      features: p.features ? JSON.parse(p.features) : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
      additional_images: p.additional_images ? JSON.parse(p.additional_images) : []
    }));

    res.json({ success: true, count: formatted.length, products: formatted });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id - Single product details + related items
router.get('/:id', async (req, res) => {
  try {
    const product = await getOne(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const formatted = {
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      additional_images: product.additional_images ? JSON.parse(product.additional_images) : []
    };

    // Fetch related products in same category
    const relatedProducts = await getAll(
      `SELECT id, name, brand, category_name, availability, main_image, price_text FROM products WHERE category_name = ? AND id != ? AND is_active = true LIMIT 4`,
      [product.category_name, product.id]
    );

    // Fetch matching spare parts based on category / keyword
    const spareParts = await getAll(
      `SELECT * FROM spare_parts WHERE (category LIKE ? OR compatible_with LIKE ? OR name LIKE ?) AND is_active = true LIMIT 4`,
      [`%${product.category_name}%`, `%${product.brand}%`, `%${product.name}%`]
    );

    res.json({
      success: true,
      product: formatted,
      relatedProducts,
      relatedSpareParts: spareParts
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/products - Admin add new product
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      brand,
      category_id,
      category_name,
      description,
      features,
      specifications,
      model_number,
      availability,
      price_text,
      is_most_selling,
      is_active,
      main_image,
      additional_images
    } = req.body;

    if (!name || !brand) {
      return res.status(400).json({ success: false, message: 'Product Name and Brand are required.' });
    }

    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : (features || '[]');
    const specsStr = typeof specifications === 'object' ? JSON.stringify(specifications) : (specifications || '{}');
    const imagesStr = Array.isArray(additional_images) ? JSON.stringify(additional_images) : '[]';

    const result = await runQuery(
      `INSERT INTO products (name, brand, category_id, category_name, description, features, specifications, model_number, availability, price_text, is_most_selling, is_active, main_image, additional_images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        brand,
        category_id || null,
        category_name || '',
        description || '',
        featuresStr,
        specsStr,
        model_number || '',
        availability || 'available',
        price_text || 'Contact shop for price/details',
        is_most_selling ? true : false,
        is_active !== undefined ? Boolean(is_active) : true,
        main_image || '',
        imagesStr
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      productId: result.lastID
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
});

// PUT /api/products/:id - Admin edit product
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const existing = await getOne(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      name,
      brand,
      category_id,
      category_name,
      description,
      features,
      specifications,
      model_number,
      availability,
      price_text,
      is_most_selling,
      is_active,
      main_image,
      additional_images
    } = req.body;

    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : (features !== undefined ? features : existing.features);
    const specsStr = typeof specifications === 'object' ? JSON.stringify(specifications) : (specifications !== undefined ? specifications : existing.specifications);
    const imagesStr = Array.isArray(additional_images) ? JSON.stringify(additional_images) : (additional_images !== undefined ? additional_images : existing.additional_images);

    await runQuery(
      `UPDATE products SET
        name = ?,
        brand = ?,
        category_id = ?,
        category_name = ?,
        description = ?,
        features = ?,
        specifications = ?,
        model_number = ?,
        availability = ?,
        price_text = ?,
        is_most_selling = ?,
        is_active = ?,
        main_image = ?,
        additional_images = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name !== undefined ? name : existing.name,
        brand !== undefined ? brand : existing.brand,
        category_id !== undefined ? category_id : existing.category_id,
        category_name !== undefined ? category_name : existing.category_name,
        description !== undefined ? description : existing.description,
        featuresStr,
        specsStr,
        model_number !== undefined ? model_number : existing.model_number,
        availability !== undefined ? availability : existing.availability,
        price_text !== undefined ? price_text : existing.price_text,
        is_most_selling !== undefined ? Boolean(is_most_selling) : Boolean(existing.is_most_selling),
        is_active !== undefined ? Boolean(is_active) : Boolean(existing.is_active),
        main_image !== undefined ? main_image : existing.main_image,
        imagesStr,
        productId
      ]
    );

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id - Admin delete product
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const existing = await getOne(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await runQuery(`DELETE FROM products WHERE id = ?`, [productId]);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

module.exports = router;
