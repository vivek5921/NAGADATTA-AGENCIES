const express = require('express');
const router = express.Router();
const { getAll, runQuery, isPg } = require('../db/index');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/settings - Public retrieval of shop details
router.get('/', async (req, res) => {
  try {
    const rows = await getAll(`SELECT key, value FROM shop_settings`);
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch shop settings.' });
  }
});

// PUT /api/settings - Admin edit shop settings
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body; // Key-value object
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, message: 'Settings object is required.' });
    }

    const upsertSql = `INSERT INTO shop_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== null) {
        await runQuery(upsertSql, [key, String(value)]);
      }
    }

    res.json({ success: true, message: 'Shop settings updated successfully.' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ success: false, message: 'Failed to update shop settings.' });
  }
});

module.exports = router;
