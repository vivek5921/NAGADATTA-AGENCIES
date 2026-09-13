const app = require('./app');
const migrate = require('./db/migrate');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Run non-destructive database table verification (CREATE TABLE IF NOT EXISTS)
    await migrate();
    
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  Nagadatta Agencies Server running on port ${PORT}`);
      console.log(`  API Base: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();

