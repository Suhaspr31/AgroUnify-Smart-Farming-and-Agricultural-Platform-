require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const { hashPassword } = require('../src/utils/encryption');
const logger = require('../src/core/logger');

// Import models
const User = require('../src/features/user/user.model');
const Farm = require('../src/features/farm/farm.model');
const Field = require('../src/features/field/field.model');
const Crop = require('../src/features/crop/crop.model');
const Product = require('../src/features/product/product.model');

/**
 * Seed Users
 */
const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');
    
    await User.deleteMany({});

    const users = [
      {
        name: 'Admin User',
        email: 'admin@agrounify.com',
        password: await hashPassword('admin123'),
        role: 'admin',
        phone: '9876543210',
        location: 'Bangalore, Karnataka',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Rajesh Kumar',
        email: 'farmer@agrounify.com',
        password: await hashPassword('password123'),
        role: 'farmer',
        phone: '9876543211',
        location: 'Mysore, Karnataka',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Priya Sharma',
        email: 'buyer@agrounify.com',
        password: await hashPassword('password123'),
        role: 'buyer',
        phone: '9876543212',
        location: 'Bangalore, Karnataka',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'AgriStore Vendor',
        email: 'vendor@agrounify.com',
        password: await hashPassword('password123'),
        role: 'vendor',
        phone: '9876543213',
        location: 'Bangalore, Karnataka',
        isActive: true,
        isEmailVerified: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Seeded ${createdUsers.length} users`);
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

/**
 * Seed Farms
 */
const seedFarms = async (users) => {
  try {
    console.log('🚜 Seeding farms...');
    
    await Farm.deleteMany({});

    const farmer = users.find(u => u.role === 'farmer');
    
    if (!farmer) {
      console.log('⚠️ No farmer user found, skipping farm seeding');
      return [];
    }

    const farms = [
      {
        name: 'Green Valley Farm',
        owner: farmer._id,
        location: {
          address: 'Village Rampur, NH-58',
          city: 'Meerut',
          state: 'Uttar Pradesh',
          pincode: '250001',
          coordinates: {
            latitude: 28.9845,
            longitude: 77.7064
          }
        },
        totalArea: 25.5,
        areaUnit: 'acre',
        soilType: 'loamy',
        irrigationType: 'drip',
        description: 'Sustainable organic farming with modern irrigation systems',
        isActive: true
      },
      {
        name: 'Sunrise Farmland',
        owner: farmer._id,
        location: {
          address: 'Kharkhoda Road',
          city: 'Sonipat',
          state: 'Haryana',
          pincode: '131001',
          coordinates: {
            latitude: 28.9931,
            longitude: 77.0151
          }
        },
        totalArea: 15.0,
        areaUnit: 'acre',
        soilType: 'black',
        irrigationType: 'sprinkler',
        description: 'Traditional farming methods with focus on quality produce',
        isActive: true
      }
    ];

    const createdFarms = await Farm.insertMany(farms);
    console.log(`✅ Seeded ${createdFarms.length} farms`);
    
    return createdFarms;
  } catch (error) {
    console.error('❌ Error seeding farms:', error);
    throw error;
  }
};

/**
 * Seed Fields
 */
const seedFields = async (farms) => {
  try {
    console.log('🗺️ Seeding fields...');
    
    await Field.deleteMany({});

    if (!farms || farms.length === 0) {
      console.log('⚠️ No farms found, skipping field seeding');
      return [];
    }

    const farm = farms[0];

    const fields = [
      {
        name: 'Field A - North',
        farm: farm._id,
        area: 10.0,
        soilType: 'loamy',
        soilPH: 6.8,
        irrigationType: 'drip',
        isActive: true
      },
      {
        name: 'Field B - South',
        farm: farm._id,
        area: 8.5,
        soilType: 'loamy',
        soilPH: 7.1,
        irrigationType: 'drip',
        isActive: true
      },
      {
        name: 'Field C - East',
        farm: farm._id,
        area: 7.0,
        soilType: 'red',
        soilPH: 6.5,
        irrigationType: 'sprinkler',
        isActive: true
      }
    ];

    const createdFields = await Field.insertMany(fields);
    console.log(`✅ Seeded ${createdFields.length} fields`);
    
    return createdFields;
  } catch (error) {
    console.error('❌ Error seeding fields:', error);
    throw error;
  }
};

/**
 * Seed Crops
 */
const seedCrops = async (fields, users) => {
  try {
    console.log('🌾 Seeding crops...');
    
    await Crop.deleteMany({});

    if (!fields || fields.length === 0) {
      console.log('⚠️ No fields found, skipping crop seeding');
      return [];
    }

    const farmer = users.find(u => u.role === 'farmer');

    const crops = [
      {
        name: 'Wheat',
        variety: 'HD-2967',
        field: fields[0]._id,
        farmer: farmer._id,
        plantingDate: new Date('2024-11-15'),
        expectedHarvestDate: new Date('2025-04-15'),
        stage: 'vegetative',
        health: 'good',
        expectedYield: 3500,
        yieldUnit: 'kg',
        isHarvested: false
      },
      {
        name: 'Rice',
        variety: 'Basmati 1121',
        field: fields[1]._id,
        farmer: farmer._id,
        plantingDate: new Date('2024-06-15'),
        expectedHarvestDate: new Date('2024-10-20'),
        actualHarvestDate: new Date('2024-10-18'),
        stage: 'harvest',
        health: 'excellent',
        expectedYield: 4000,
        actualYield: 4200,
        yieldUnit: 'kg',
        isHarvested: true
      },
      {
        name: 'Cotton',
        variety: 'Bt Cotton',
        field: fields[2]._id,
        farmer: farmer._id,
        plantingDate: new Date('2024-05-20'),
        expectedHarvestDate: new Date('2024-10-25'),
        stage: 'maturity',
        health: 'fair',
        expectedYield: 1500,
        yieldUnit: 'kg',
        isHarvested: false
      }
    ];

    const createdCrops = await Crop.insertMany(crops);
    
    // Update fields with current crops
    await Field.findByIdAndUpdate(fields[0]._id, { currentCrop: createdCrops[0]._id });
    await Field.findByIdAndUpdate(fields[1]._id, { currentCrop: createdCrops[1]._id });
    await Field.findByIdAndUpdate(fields[2]._id, { currentCrop: createdCrops[2]._id });
    
    console.log(`✅ Seeded ${createdCrops.length} crops`);
    
    return createdCrops;
  } catch (error) {
    console.error('❌ Error seeding crops:', error);
    throw error;
  }
};

/**
 * Seed Products
 */
const seedProducts = async (users) => {
  try {
    console.log('📦 Seeding products...');
    
    await Product.deleteMany({});

    const vendor = users.find(u => u.role === 'vendor');

    if (!vendor) {
      console.log('⚠️ No vendor user found, skipping product seeding');
      return [];
    }

    const products = [
      {
        name: 'Wheat Seeds HD-2967',
        description: 'High yielding wheat variety suitable for North Indian climate. Excellent disease resistance and grain quality.',
        category: 'seeds',
        price: 50,
        unit: 'kg',
        vendor: vendor._id,
        stock: 500,
        discount: 10,
        specifications: {
          brand: 'Premium Seeds',
          germination: '95%',
          purity: '98%',
          variety: 'HD-2967'
        },
        isActive: true
      },
      {
        name: 'NPK Fertilizer 12:32:16',
        description: 'Balanced NPK fertilizer for optimal crop growth. Suitable for all soil types.',
        category: 'fertilizers',
        price: 30,
        unit: 'kg',
        vendor: vendor._id,
        stock: 1000,
        discount: 5,
        specifications: {
          brand: 'Nutri-Rich',
          nitrogen: '12%',
          phosphorus: '32%',
          potassium: '16%'
        },
        isActive: true
      },
      {
        name: 'Organic Pesticide - Neem Based',
        description: 'Eco-friendly organic pesticide made from neem extracts. Safe for humans and environment.',
        category: 'pesticides',
        price: 250,
        unit: 'liter',
        vendor: vendor._id,
        stock: 200,
        discount: 15,
        specifications: {
          brand: 'EcoPest',
          active: 'Neem Oil Extract',
          concentration: '1500 ppm',
          organic: 'Certified'
        },
        isActive: true
      },
      {
        name: 'Drip Irrigation Kit - 1 Acre',
        description: 'Complete drip irrigation system for 1 acre. Includes pipes, emitters, and control valves.',
        category: 'equipment',
        price: 15000,
        unit: 'piece',
        vendor: vendor._id,
        stock: 25,
        specifications: {
          brand: 'AquaDrip',
          coverage: '1 acre',
          emitters: '500 pcs',
          warranty: '2 years'
        },
        isActive: true
      },
      {
        name: 'Weeding Tool - Manual',
        description: 'Ergonomic manual weeding tool. Durable steel construction with comfortable grip.',
        category: 'tools',
        price: 350,
        unit: 'piece',
        vendor: vendor._id,
        stock: 100,
        discount: 20,
        specifications: {
          brand: 'FarmTools',
          material: 'Steel',
          weight: '1.2 kg'
        },
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);
    
    return createdProducts;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

/**
 * Main seed function
 */
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    console.log('');

    // Connect to database
    await connectDatabase();

    // Seed data in order
    const users = await seedUsers();
    const farms = await seedFarms(users);
    const fields = await seedFields(farms);
    const crops = await seedCrops(fields, users);
    const products = await seedProducts(users);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🚜 Farms: ${farms.length}`);
    console.log(`   🗺️  Fields: ${fields.length}`);
    console.log(`   🌾 Crops: ${crops.length}`);
    console.log(`   📦 Products: ${products.length}`);
    console.log('');
    console.log('🔑 Test Credentials:');
    console.log('   Admin:  admin@agrounify.com / admin123');
    console.log('   Farmer: farmer@agrounify.com / password123');
    console.log('   Buyer:  buyer@agrounify.com / password123');
    console.log('   Vendor: vendor@agrounify.com / password123');
    console.log('');

    // Disconnect
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Database seeding failed:', error);
    console.error('');
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
