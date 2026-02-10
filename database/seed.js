const path = require('path');

// Resolve modules from backend/node_modules
const backendDir = path.join(__dirname, '..', 'backend');
const mongoose = require(path.join(backendDir, 'node_modules', 'mongoose'));
require(path.join(backendDir, 'node_modules', 'dotenv')).config({ path: path.join(backendDir, '.env') });

const InventoryItem = require(path.join(backendDir, 'models', 'InventoryItem'));

const sampleItems = [
  {
    sku: 'SKU-0001',
    name: 'USB Keyboard',
    category: 'Accessories',
    quantity: 25,
    unitPrice: 12.50,
    supplier: 'Tech Supplier A',
    status: 'active',
    note: 'Basic model',
  },
  {
    sku: 'SKU-0002',
    name: 'Wireless Mouse',
    category: 'Accessories',
    quantity: 40,
    unitPrice: 9.99,
    supplier: 'Tech Supplier B',
    status: 'active',
    note: null,
  },
  {
    sku: 'SKU-0003',
    name: '27-inch Monitor',
    category: 'Display',
    quantity: 10,
    unitPrice: 149.00,
    supplier: 'Tech Supplier A',
    status: 'inactive',
    note: 'Discontinued',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await InventoryItem.deleteMany({});
    console.log('Cleared existing inventory items');

    // Insert sample data
    const result = await InventoryItem.insertMany(sampleItems);
    console.log(`Inserted ${result.length} sample items:`);
    result.forEach((item) => {
      console.log(`  - ${item.sku}: ${item.name}`);
    });

    console.log('\nSeed completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
