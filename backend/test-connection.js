const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MongoDB connection...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!\n');

    // Get database info
    const db = mongoose.connection.db;
    const adminDb = db.admin();
    const serverInfo = await adminDb.serverInfo();
    console.log('MongoDB Version:', serverInfo.version);
    console.log('Database:', mongoose.connection.name);

    // Check collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections:', collectionNames.length > 0 ? collectionNames.join(', ') : '(none)');

    if (collectionNames.includes('inventoryitems')) {
      const count = await db.collection('inventoryitems').countDocuments();
      console.log('Total items in inventoryitems:', count);
    } else {
      console.log('\nCollection "inventoryitems" not found - run "node database/seed.js" to seed data');
    }

    console.log('\n--- Connection test PASSED ---');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Connection FAILED!\n');
    console.error('Error:', error.message);

    if (error.name === 'MongoServerSelectionError') {
      console.error('\nPossible issues:');
      console.error('- MongoDB is not running');
      console.error('- MongoDB is not installed');
      console.error('- Connection string is incorrect in .env');
    }

    process.exit(1);
  }
}

testConnection();
