const bcrypt = require('bcryptjs');
const { runQuery, getOne, getAll, isPg } = require('./index');

async function seedDatabase() {
  console.log('[SEED] Initializing database tables and seeding demo data...');

  // 1. Create Tables (PostgreSQL vs SQLite)
  if (isPg) {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category_id INT,
        category_name VARCHAR(100),
        description TEXT,
        features TEXT,
        specifications TEXT,
        model_number VARCHAR(100),
        availability VARCHAR(50) DEFAULT 'available',
        price_text VARCHAR(100) DEFAULT 'Contact shop for price/details',
        is_most_selling BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        main_image TEXT,
        additional_images TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS spare_parts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url TEXT,
        compatible_with TEXT,
        model_number VARCHAR(100),
        availability VARCHAR(50) DEFAULT 'available',
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS shop_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  } else {
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
        image_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        additional_images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS spare_parts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        compatible_with TEXT,
        model_number TEXT,
        availability TEXT DEFAULT 'available',
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS shop_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }

  // 2. Default Admin User
  const existingAdmin = await getOne(`SELECT * FROM users WHERE username = ?`, ['admin']);
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    await runQuery(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`, ['admin', hash, 'admin']);
    console.log('[SEED] Admin user created (username: admin, password: admin123)');
  }

  // 3. Shop Settings (Seed ONLY if empty; NEVER overwrite existing settings)
  const existingSettings = await getAll(`SELECT key FROM shop_settings`);
  if (existingSettings.length === 0) {
    const initialSettings = {
      shop_name: "Nagadatta Agencies",
      tagline: "Electrical & Home Appliances",
      hero_title: "Nagadatta Agencies",
      hero_subtitle: "Your Trusted Electrical & Home Appliance Store",
      hero_description: "Karimnagar's trusted showroom providing premium air coolers, high-speed fans, water heaters, geysers, electric cookers, mixer grinders, gas stoves, genuine spare parts and electrical home appliances.",
      phone_number: "+91 98490 12345",
      whatsapp_number: "919849012345",
      email: "contact@nagadattaagencies.com",
      address: "H.No. 4-2-189, Near Tower Circle, Main Road, Karimnagar, Telangana - 505001, India",
      google_maps_url: "https://maps.google.com/?q=Karimnagar+Telangana+505001",
      instagram_url: "https://www.instagram.com/nagadatta_agencies",
      opening_hours: "Monday - Saturday: 9:00 AM - 9:00 PM | Sunday: Closed",
      about_us: "Nagadatta Agencies is a trusted showcase and distributor of high-performance electrical home appliances and genuine spare parts located in Karimnagar, Telangana. With an extensive range of top brands in coolers, ceiling & pedestal fans, geysers, mixer grinders, and kitchen appliances, we serve customers with trusted quality, authentic warranty, and reliable service.",
      footer_text: "Nagadatta Agencies - Quality Electrical & Home Appliances in Karimnagar, Telangana.",
      hero_image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      logo_url: ""
    };

    const conflictClause = isPg ? `ON CONFLICT (key) DO NOTHING` : `ON CONFLICT (key) DO NOTHING`;
    for (const [key, value] of Object.entries(initialSettings)) {
      await runQuery(`INSERT INTO shop_settings (key, value) VALUES (?, ?) ${conflictClause}`, [key, value]);
    }
    console.log('[SEED] Initial shop settings created');
  }

  // 4. Initial Categories
  const categoriesList = [
    { name: 'Air Coolers', slug: 'air-coolers', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80', order: 1 },
    { name: 'Fans', slug: 'fans', image: 'https://images.unsplash.com/photo-1618941709602-92809f6b92a2?auto=format&fit=crop&w=500&q=80', order: 2 },
    { name: 'Water Heaters', slug: 'water-heaters', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80', order: 3 },
    { name: 'Geysers', slug: 'geysers', image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=500&q=80', order: 4 },
    { name: 'Electric Cookers', slug: 'electric-cookers', image: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=500&q=80', order: 5 },
    { name: 'Mixer Grinders', slug: 'mixer-grinders', image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=500&q=80', order: 6 },
    { name: 'Stoves', slug: 'stoves', image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=80', order: 7 },
    { name: 'Kitchen Appliances', slug: 'kitchen-appliances', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80', order: 8 },
    { name: 'Electrical Appliances', slug: 'electrical-appliances', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80', order: 9 },
    { name: 'Home Appliances', slug: 'home-appliances', image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=500&q=80', order: 10 },
    { name: 'Spare Parts', slug: 'spare-parts', image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80', order: 11 },
    { name: 'Other Products', slug: 'other-products', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80', order: 12 }
  ];

  const existingCategories = await getAll(`SELECT * FROM categories`);
  if (existingCategories.length === 0) {
    for (const c of categoriesList) {
      await runQuery(
        `INSERT INTO categories (name, slug, image_url, is_active, display_order) VALUES (?, ?, ?, ?, ?)`,
        [c.name, c.slug, c.image, true, c.order]
      );
    }
    console.log('[SEED] Initial categories seeded');
  }

  // Fetch category IDs
  const cats = await getAll(`SELECT * FROM categories`);
  const catMap = {};
  cats.forEach(c => { catMap[c.name] = c.id; });

  // 5. Initial Products
  const existingProducts = await getAll(`SELECT * FROM products`);
  if (existingProducts.length === 0) {
    const productsData = [
      {
        name: "V-Guard Desert Air Cooler 85L",
        brand: "V-Guard",
        category_id: catMap["Air Coolers"] || 1,
        category_name: "Air Coolers",
        description: "Heavy duty desert air cooler with 85-liter water tank, powerful air throw up to 50 feet, dense honeycomb pads, and ice chamber.",
        features: JSON.stringify(["85 Liters Water Capacity", "50 Feet Air Throw", "Honeycomb Cooling Pads", "Inverter Compatible", "Castor Wheels for Mobility"]),
        specifications: JSON.stringify({ "Water Capacity": "85 Liters", "Power Consumption": "190W", "Air Delivery": "4200 m3/hr", "Speed Control": "3 Levels" }),
        model_number: "VGD-DC-85L",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify(["https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80"])
      },
      {
        name: "Symphony Surround 50L Personal Cooler",
        brand: "Symphony",
        category_id: catMap["Air Coolers"] || 1,
        category_name: "Air Coolers",
        description: "Sleek and compact tower air cooler designed for bedrooms and living spaces with i-Pure technology and quiet operation.",
        features: JSON.stringify(["50 Liters Water Tank", "i-Pure Air Purification Filter", "Low Power Consumption", "Touch Control Panel"]),
        specifications: JSON.stringify({ "Capacity": "50L", "Coverage": "300 sq.ft", "Wattage": "140W" }),
        model_number: "SYM-SURROUND-50",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Bajaj PX97 Torque 36L Personal Air Cooler",
        brand: "Bajaj",
        category_id: catMap["Air Coolers"] || 1,
        category_name: "Air Coolers",
        description: "Durable personal cooler with Hexacool technology for superior cooling and antibacterial hexacool pads.",
        features: JSON.stringify(["36 Liters Capacity", "Hexacool Technology", "Turbo Fan Technology", "3-Speed Fan Control"]),
        specifications: JSON.stringify({ "Capacity": "36 Liters", "Power": "100 Watts", "Color": "White & Grey" }),
        model_number: "BJ-PX97-36L",
        availability: "limited",
        is_most_selling: 0,
        main_image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Crompton High-Speed 1200mm Ceiling Fan",
        brand: "Crompton",
        category_id: catMap["Fans"] || 2,
        category_name: "Fans",
        description: "Energy-efficient high-speed ceiling fan with 100% copper motor, double ball bearing, and aerodynamically designed blades.",
        features: JSON.stringify(["1200mm Sweep Size", "380 RPM High Speed", "100% Copper Winding", "Double Ball Bearing"]),
        specifications: JSON.stringify({ "Sweep": "1200 mm", "RPM": "380", "Air Delivery": "230 CMM", "Wattage": "72W" }),
        model_number: "CRM-HS-1200",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1618941709602-92809f6b92a2?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Havells Efficiencia Neo 5-Star BLDC Ceiling Fan",
        brand: "Havells",
        category_id: catMap["Fans"] || 2,
        category_name: "Fans",
        description: "Ultra energy saving BLDC motor ceiling fan with smart remote control and 65% power saving capability.",
        features: JSON.stringify(["BLDC Smart Motor", "Saves up to 65% Electricity", "Includes Smart Remote Control", "Runs 3x Longer on Inverter"]),
        specifications: JSON.stringify({ "Power": "26W", "Sweep": "1200mm", "Speed": "350 RPM" }),
        model_number: "HVL-BLDC-1200",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1618941709602-92809f6b92a2?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Orient Electric 400mm Wall Fan with Remote",
        brand: "Orient",
        category_id: catMap["Fans"] || 2,
        category_name: "Fans",
        description: "High speed wall mounted oscillating fan with remote control for easy speed regulation and timer settings.",
        features: JSON.stringify(["400mm Sweep", "Remote Control Included", "90 Degree Oscillation", "Thermal Overload Protection"]),
        specifications: JSON.stringify({ "Sweep": "400mm", "Power": "55W", "RPM": "1330" }),
        model_number: "OE-WF-400R",
        availability: "available",
        is_most_selling: 0,
        main_image: "https://images.unsplash.com/photo-1618941709602-92809f6b92a2?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "V-Guard Victo 15 Liters Vertical Storage Geyser",
        brand: "V-Guard",
        category_id: catMap["Water Heaters"] || 3,
        category_name: "Water Heaters",
        description: "5-Star rated vertical storage water heater with titanium enriched enamel tank coating and superior heat retention insulation.",
        features: JSON.stringify(["15 Liters Storage Capacity", "5-Star Energy Rating", "Titanium Enriched Vitreous Enamel Coating", "High-Pressure Resistance up to 8 Bar"]),
        specifications: JSON.stringify({ "Capacity": "15L", "Wattage": "2000W", "Star Rating": "5 Star", "Warranty": "2 Years Overall" }),
        model_number: "VGD-VICTO-15L",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "AO Smith 25L Vertical Storage Geyser",
        brand: "AO Smith",
        category_id: catMap["Geysers"] || 4,
        category_name: "Geysers",
        description: "Premium Blue Diamond glass-lined tank storage geyser with anode rod protection for long life in hard water conditions.",
        features: JSON.stringify(["25L Storage", "Blue Diamond Glass Lined Tank", "Anode Rod Protection", "Digital Temperature Display"]),
        specifications: JSON.stringify({ "Capacity": "25L", "Rating": "5 Star", "Pressure": "8 Bar" }),
        model_number: "AOS-HSE-25",
        availability: "available",
        is_most_selling: 0,
        main_image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Sujata Dynamix 900W Mixer Grinder with 3 Jars",
        brand: "Sujata",
        category_id: catMap["Grinders / Mixer Grinders"] || 6,
        category_name: "Grinders / Mixer Grinders",
        description: "Heavy duty 900-Watt commercial and household mixer grinder with double ball bearings and unbreakable polycarbonate jars.",
        features: JSON.stringify(["900 Watt Heavy Duty Motor", "90 Minutes Continuous Running", "3 Stainless Steel & Polycarbonate Jars", "High Efficiency Blades"]),
        specifications: JSON.stringify({ "Wattage": "900W", "Motor Speed": "22000 RPM", "Jars Included": "Chutney, Grinding, Wet Mixing" }),
        model_number: "SJT-DYNAMIX-900",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Prestige Deluxe 1.8 Liters Electric Rice Cooker",
        brand: "Prestige",
        category_id: catMap["Electric Cookers"] || 5,
        category_name: "Electric Cookers",
        description: "Automatic warm and cook electric cooker with anodized aluminum cooking pan and stainless steel scoop lid.",
        features: JSON.stringify(["1.8 Liters Capacity", "Keep Warm Function", "Control Panel Indicators", "Detachable Power Cord"]),
        specifications: JSON.stringify({ "Capacity": "1.8L", "Power": "700W", "Voltage": "230V" }),
        model_number: "PRST-ERC-1.8",
        availability: "available",
        is_most_selling: 0,
        main_image: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Prestige 3-Burner Toughened Glass Gas Stove",
        brand: "Prestige",
        category_id: catMap["Stoves"] || 7,
        category_name: "Stoves",
        description: "Spill-proof design gas stove with high efficiency tri-pin brass burners and toughened black glass top.",
        features: JSON.stringify(["3 Brass Burners", "Toughened Glass Top", "Spill-Proof Drip Trays", "Ergonomic Knobs"]),
        specifications: JSON.stringify({ "Burners": "3 (1 Small, 1 Medium, 1 Large)", "Ignition": "Manual", "Body": "Glass & Steel" }),
        model_number: "PRST-GS-3B",
        availability: "available",
        is_most_selling: 1,
        main_image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      },
      {
        name: "Philips Hi-Gloss 750W Heavy Weight Dry Iron",
        brand: "Philips",
        category_id: catMap["Electrical Appliances"] || 9,
        category_name: "Electrical Appliances",
        description: "Heavy weight traditional dry iron with Linishing non-stick coated soleplate for smooth gliding and crisp ironed clothes.",
        features: JSON.stringify(["750 Watts Power", "Heavy Weight Soleplate", "Temperature Control Knob", "180 Degree Swivel Cord"]),
        specifications: JSON.stringify({ "Power": "750W", "Weight": "1.6 kg", "Voltage": "240V" }),
        model_number: "PHL-IRON-750",
        availability: "available",
        is_most_selling: 0,
        main_image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
        additional_images: JSON.stringify([])
      }
    ];

    for (const p of productsData) {
      await runQuery(
        `INSERT INTO products (name, brand, category_id, category_name, description, features, specifications, model_number, availability, price_text, is_most_selling, is_active, main_image, additional_images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.brand, p.category_id, p.category_name, p.description, p.features, p.specifications, p.model_number, p.availability, "Contact shop for price/details", p.is_most_selling === 1, true, p.main_image, p.additional_images]
      );
    }
    console.log('[SEED] Initial products seeded');
  }

  // 6. Initial Spare Parts
  const existingSpareParts = await getAll(`SELECT * FROM spare_parts`);
  if (existingSpareParts.length === 0) {
    const sparePartsData = [
      {
        name: "V-Guard Heavy Duty Submersible Cooler Pump",
        category: "Cooler Spare Parts",
        compatible_with: "V-Guard, Symphony, Bajaj and all major air cooler brands",
        model_number: "VGD-PUMP-18W",
        availability: "available",
        description: "18W submersible water pump with copper winding and anti-corrosive body for high water lift capacity up to 6 feet.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Symphony Air Cooler Motor 110W Heavy Duty",
        category: "Cooler Spare Parts",
        compatible_with: "Symphony desert and tower air coolers",
        model_number: "SYM-MTR-110W",
        availability: "available",
        description: "110W high RPM copper wound replacement motor for Symphony and universal air coolers.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "High-Density Honeycomb Cooling Pad Set (3-Piece)",
        category: "Cooler Spare Parts",
        compatible_with: "Fits 65L - 90L Desert Coolers",
        model_number: "HCP-PAD-90L",
        availability: "available",
        description: "Odourless high absorption cellulose honeycomb cooling pads for optimal water retention and cooling performance.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Havells 2.5 MFD Fan Motor Capacitor",
        category: "Fan Spare Parts",
        compatible_with: "All standard 1200mm Ceiling Fans",
        model_number: "CAP-2.5MFD",
        availability: "available",
        description: "Original long life 2.5 MFD polypropylene capacitor for ceiling fans.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Crompton 5-Step Stepless Modular Fan Regulator",
        category: "Fan Spare Parts",
        compatible_with: "Crompton, Anchor, and modular switch boards",
        model_number: "REG-5STEP-MOD",
        availability: "available",
        description: "Hum-free step-type electronic ceiling fan speed regulator switch.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Sujata Mixer Grinder Stainless Steel Chutney Jar 400ml",
        category: "Grinder Spare Parts",
        compatible_with: "Sujata Dynamix, Powermatic, and Supermix models",
        model_number: "SJT-JAR-400ML",
        availability: "available",
        description: "Original heavy gauge stainless steel chutney jar with razor sharp blade and leak-proof lid.",
        image_url: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Universal Rubber Coupler for Mixer Grinders (Pack of 5)",
        category: "Grinder Spare Parts",
        compatible_with: "Sujata, Prestige, Maharaja, Bajaj, Butterfly mixer grinders",
        model_number: "CPLR-RUB-5P",
        availability: "available",
        description: "Heavy duty rubber drive coupler set for motor and jar engagement.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "V-Guard Geyser 2000W Copper Heating Element with Flange",
        category: "Water Heater/Geyser Spare Parts",
        compatible_with: "V-Guard Victo, Pebbla, and standard storage geysers",
        model_number: "ELM-2000W-COP",
        availability: "available",
        description: "High-grade heavy copper tubular heating element for fast water heating and long rust-free lifespan.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Automatic Capillary Thermostat Control Switch for Geysers",
        category: "Water Heater/Geyser Spare Parts",
        compatible_with: "All 10L, 15L, 25L storage geysers",
        model_number: "THRM-CAP-GEY",
        availability: "available",
        description: "Precision temperature cutout thermostat for water heaters to prevent overheating and dry burning.",
        image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
      }
    ];

    for (const sp of sparePartsData) {
      await runQuery(
        `INSERT INTO spare_parts (name, category, compatible_with, model_number, availability, description, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sp.name, sp.category, sp.compatible_with, sp.model_number, sp.availability, sp.description, sp.image_url, true]
      );
    }
    console.log('[SEED] Initial spare parts seeded');
  }

  console.log('[SEED] Database seeding finished successfully!');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('[SEED] Error seeding database:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
