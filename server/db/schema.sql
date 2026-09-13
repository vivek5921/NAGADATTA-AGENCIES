-- Nagadatta Agencies Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    cloudinary_public_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    description TEXT,
    features TEXT, -- JSON string array
    specifications TEXT, -- JSON string object
    model_number VARCHAR(100),
    availability VARCHAR(50) DEFAULT 'available', -- 'available', 'limited', 'out_of_stock'
    price_text VARCHAR(100) DEFAULT 'Contact shop for price/details',
    is_most_selling BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    main_image TEXT,
    main_image_public_id VARCHAR(255),
    additional_images TEXT, -- JSON string array of image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spare_parts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100) NOT NULL, -- e.g., 'Cooler Spare Parts', 'Fan Spare Parts'
    image_url TEXT,
    cloudinary_public_id VARCHAR(255),
    compatible_with TEXT, -- e.g., 'Compatible with V-Guard cooler models'
    model_number VARCHAR(100),
    availability VARCHAR(50) DEFAULT 'available', -- 'available', 'limited', 'out_of_stock'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL
);

-- Ensure all columns exist on pre-created PostgreSQL tables
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image_public_id VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images TEXT;

ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);

