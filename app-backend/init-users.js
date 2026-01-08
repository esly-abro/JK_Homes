/**
 * Initialize Test Users in MongoDB
 * Creates owner, admin, and agent users for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jkhomes';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'manager', 'agent', 'bpo'],
    default: 'agent'
  },
  zohoUserId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function initializeUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`⚠️  Found ${existingUsers} existing users`);
      console.log('Clearing existing users...');
      await User.deleteMany({});
    }

    // Create test users
    const users = [
      {
        email: 'owner@jkhomes.com',
        passwordHash: await bcrypt.hash('owner123', 10),
        name: 'Owner User',
        role: 'owner'
      },
      {
        email: 'admin@jkhomes.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'manager@jkhomes.com',
        passwordHash: await bcrypt.hash('manager123', 10),
        name: 'Manager User',
        role: 'manager'
      },
      {
        email: 'agent@jkhomes.com',
        passwordHash: await bcrypt.hash('agent123', 10),
        name: 'Agent User',
        role: 'agent'
      },
      {
        email: 'bpo@jkhomes.com',
        passwordHash: await bcrypt.hash('bpo123', 10),
        name: 'BPO User',
        role: 'bpo'
      }
    ];

    console.log('Creating test users...\n');
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created: ${user.email} (${user.role})`);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  Test Users Created Successfully!');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('Login Credentials:\n');
    console.log('Owner:   owner@jkhomes.com   / owner123');
    console.log('Admin:   admin@jkhomes.com   / admin123');
    console.log('Manager: manager@jkhomes.com / manager123');
    console.log('Agent:   agent@jkhomes.com   / agent123');
    console.log('BPO:     bpo@jkhomes.com     / bpo123');
    
    console.log('\n🌐 Open: http://localhost:5173');
    console.log('   Use any credentials above to login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

initializeUsers();
