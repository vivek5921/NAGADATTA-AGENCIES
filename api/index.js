const app = require('../server/app');
const migrate = require('../server/db/migrate');

let isMigrated = false;

module.exports = async (req, res) => {
  // Lazily ensure database schema tables exist on cold start without resetting data
  if (!isMigrated) {
    try {
      await migrate();
      isMigrated = true;
    } catch (err) {
      console.error('[VERCEL API] Migration verification failed:', err);
    }
  }

  return app(req, res);
};
