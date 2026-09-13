const { runQuery, isPg, getAll } = require('./index');
const seedDatabase = require('./seed');

async function migrate() {
  console.log(`[MIGRATION] Starting database migration (${isPg ? 'PostgreSQL' : 'SQLite'})...`);

  // Ensure tables exist
  if (isPg) {
    const fs = require('fs');
    const path = require('path');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await runQuery(stmt);
    }
  } else {
    // SQLite table creation
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        cloudinary_public_id TEXT,
        is_active BOOLEAN DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        category_id INTEGER,
        category_name TEXT,
        description TEXT,
        features TEXT,
        specifications TEXT,
        model_number TEXT,
        availability TEXT DEFAULT 'available',
        price_text TEXT DEFAULT 'Contact shop for price/details',
        is_most_selling BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        main_image TEXT,
        main_image_public_id TEXT,
        additional_images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        image_url TEXT NOT NULL,
        cloudinary_public_id TEXT,
        is_primary BOOLEAN DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS spare_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT NOT NULL,
        image_url TEXT,
        cloudinary_public_id TEXT,
        compatible_with TEXT,
        model_number TEXT,
        availability TEXT DEFAULT 'available',
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS shop_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Ensure all columns exist in SQLite tables if created with earlier schema
    try {
      const catCols = await getAll(`PRAGMA table_info(categories)`);
      const catNames = catCols.map(c => c.name);
      if (!catNames.includes('description')) await runQuery(`ALTER TABLE categories ADD COLUMN description TEXT`);
      if (!catNames.includes('cloudinary_public_id')) await runQuery(`ALTER TABLE categories ADD COLUMN cloudinary_public_id TEXT`);
      if (!catNames.includes('updated_at')) await runQuery(`ALTER TABLE categories ADD COLUMN updated_at DATETIME`);

      const prodCols = await getAll(`PRAGMA table_info(products)`);
      const prodNames = prodCols.map(c => c.name);
      if (!prodNames.includes('main_image_public_id')) await runQuery(`ALTER TABLE products ADD COLUMN main_image_public_id TEXT`);
      if (!prodNames.includes('updated_at')) await runQuery(`ALTER TABLE products ADD COLUMN updated_at DATETIME`);

      const spareCols = await getAll(`PRAGMA table_info(spare_parts)`);
      const spareNames = spareCols.map(c => c.name);
      if (!spareNames.includes('cloudinary_public_id')) await runQuery(`ALTER TABLE spare_parts ADD COLUMN cloudinary_public_id TEXT`);
      if (!spareNames.includes('updated_at')) await runQuery(`ALTER TABLE spare_parts ADD COLUMN updated_at DATETIME`);
    } catch (e) {
      console.log('[MIGRATION] SQLite column check notice:', e.message);
    }
  }

  console.log('[MIGRATION] Tables verified.');

  // Run seed check
  await seedDatabase();
  console.log('[MIGRATION] Migration and seeding complete!');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(err => {
    console.error('[MIGRATION ERROR]', err);
    process.exit(1);
  });
}

module.exports = migrate;
