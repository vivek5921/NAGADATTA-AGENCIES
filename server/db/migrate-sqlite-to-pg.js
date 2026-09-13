const path = require('path');
const fs = require('fs');
const { isPg, db, runQuery, getAll } = require('./index');

async function migrateSqliteToPg() {
  if (!isPg) {
    console.log('[MIGRATION-IMPORT] DATABASE_URL is not PostgreSQL. Skipping import.');
    return;
  }

  const sqlitePath = path.join(__dirname, 'nagadatta.sqlite');
  if (!fs.existsSync(sqlitePath)) {
    console.log('[MIGRATION-IMPORT] No local nagadatta.sqlite found to import.');
    return;
  }

  const sqlite3 = require('sqlite3').verbose();
  const sqliteDb = new sqlite3.Database(sqlitePath);

  const getSqliteRows = (query, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  };

  try {
    const runMigrations = require('./migrate');
    await runMigrations();

    console.log('[MIGRATION-IMPORT] Inspecting target PostgreSQL tables...');

    // 1. Users
    const sqliteUsers = await getSqliteRows(`SELECT * FROM users`);
    for (const u of sqliteUsers) {
      await runQuery(
        `INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON CONFLICT (username) DO NOTHING`,
        [u.username, u.password_hash, u.role || 'admin']
      );
    }
    console.log(`[MIGRATION-IMPORT] Processed ${sqliteUsers.length} user(s) into PostgreSQL.`);

    // 2. Shop Settings
    const sqliteSettings = await getSqliteRows(`SELECT * FROM shop_settings`);
    for (const s of sqliteSettings) {
      await runQuery(
        `INSERT INTO shop_settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [s.key, s.value]
      );
    }
    console.log(`[MIGRATION-IMPORT] Processed ${sqliteSettings.length} shop setting(s) into PostgreSQL.`);

    // 3. Categories
    const sqliteCats = await getSqliteRows(`SELECT * FROM categories`);
    for (const c of sqliteCats) {
      await runQuery(
        `INSERT INTO categories (name, slug, description, image_url, cloudinary_public_id, is_active, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (slug) DO NOTHING`,
        [
          c.name,
          c.slug,
          c.description || '',
          c.image_url || '',
          c.cloudinary_public_id || '',
          c.is_active === 1 || c.is_active === true,
          c.display_order || 0
        ]
      );
    }
    console.log(`[MIGRATION-IMPORT] Processed ${sqliteCats.length} category/categories into PostgreSQL.`);

    // 4. Products (If target PostgreSQL has default seed products and sqlite has products, sync them)
    const sqliteProds = await getSqliteRows(`SELECT * FROM products`);
    if (sqliteProds.length > 0) {
      // Check if products already exist in PG by model_number or name
      for (const p of sqliteProds) {
        const existing = await getAll(`SELECT id FROM products WHERE name = ? OR (model_number = ? AND model_number != '')`, [p.name, p.model_number || '']);
        if (existing.length === 0) {
          await runQuery(
            `INSERT INTO products (name, brand, category_id, category_name, description, features, specifications, model_number, availability, price_text, is_most_selling, is_active, main_image, main_image_public_id, additional_images)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.name,
              p.brand,
              p.category_id || null,
              p.category_name || '',
              p.description || '',
              p.features || '[]',
              p.specifications || '{}',
              p.model_number || '',
              p.availability || 'available',
              p.price_text || 'Contact shop for price/details',
              p.is_most_selling === 1 || p.is_most_selling === true,
              p.is_active === 1 || p.is_active === true,
              p.main_image || '',
              p.main_image_public_id || '',
              p.additional_images || '[]'
            ]
          );
        }
      }
      console.log(`[MIGRATION-IMPORT] Processed ${sqliteProds.length} product(s) into PostgreSQL.`);
    }

    // 5. Spare Parts
    const sqliteParts = await getSqliteRows(`SELECT * FROM spare_parts`);
    if (sqliteParts.length > 0) {
      for (const sp of sqliteParts) {
        const existing = await getAll(`SELECT id FROM spare_parts WHERE name = ? AND category = ?`, [sp.name, sp.category]);
        if (existing.length === 0) {
          await runQuery(
            `INSERT INTO spare_parts (name, brand, category, image_url, cloudinary_public_id, compatible_with, model_number, availability, description, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              sp.name,
              sp.brand || '',
              sp.category,
              sp.image_url || '',
              sp.cloudinary_public_id || '',
              sp.compatible_with || '',
              sp.model_number || '',
              sp.availability || 'available',
              sp.description || '',
              sp.is_active === 1 || sp.is_active === true
            ]
          );
        }
      }
      console.log(`[MIGRATION-IMPORT] Processed ${sqliteParts.length} spare part(s) into PostgreSQL.`);
    }
    console.log('[MIGRATION-SUCCESS] SQLite to PostgreSQL migration finished cleanly!');

  } catch (err) {
    console.error('[MIGRATION-IMPORT ERROR]', err);
  } finally {
    sqliteDb.close();
  }
}

if (require.main === module) {
  migrateSqliteToPg().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = migrateSqliteToPg;
