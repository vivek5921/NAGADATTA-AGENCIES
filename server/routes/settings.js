const express = require('express');
const router = express.Router();
const { getAll, runQuery } = require('../db/index');
const { authenticateAdmin } = require('../middleware/auth');

// GET /api/settings - Public retrieval of shop details
router.get('/', async (req, res) => {
  try {
    const rows = await getAll(`SELECT key, value FROM shop_settings`);
    const settings = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    // Provide unified aliases
    if (settings.phone_number && !settings.phone) settings.phone = settings.phone_number;
    if (settings.phone && !settings.phone_number) settings.phone_number = settings.phone;

    if (settings.whatsapp_number && !settings.whatsapp) settings.whatsapp = settings.whatsapp_number;
    if (settings.whatsapp && !settings.whatsapp_number) settings.whatsapp_number = settings.whatsapp;

    if (settings.about_us && !settings.about_text) settings.about_text = settings.about_us;
    if (settings.about_text && !settings.about_us) settings.about_us = settings.about_text;

    if (settings.hero_image && !settings.hero_image_url) settings.hero_image_url = settings.hero_image;
    if (settings.hero_image_url && !settings.hero_image) settings.hero_image = settings.hero_image_url;

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

    // Populate aliases automatically
    if (updates.phone && !updates.phone_number) updates.phone_number = updates.phone;
    if (updates.phone_number && !updates.phone) updates.phone = updates.phone_number;

    if (updates.whatsapp && !updates.whatsapp_number) updates.whatsapp_number = updates.whatsapp;
    if (updates.whatsapp_number && !updates.whatsapp) updates.whatsapp = updates.whatsapp_number;

    if (updates.about_text && !updates.about_us) updates.about_us = updates.about_text;
    if (updates.about_us && !updates.about_text) updates.about_text = updates.about_us;

    if (updates.hero_image_url && !updates.hero_image) updates.hero_image = updates.hero_image_url;
    if (updates.hero_image && !updates.hero_image_url) updates.hero_image_url = updates.hero_image;

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
