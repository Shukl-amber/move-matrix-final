// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the seed script
require('./seed-db.js'); 