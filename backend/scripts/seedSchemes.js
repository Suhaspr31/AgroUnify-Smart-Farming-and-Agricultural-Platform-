const mongoose = require('mongoose');
const { Scheme } = require('../src/features/schemes/scheme.model');
const schemesData = require('../../database/seeders/schemes.json');

async function seedSchemes() {
  try {
    console.log('🌱 Seeding government schemes...');

    // Clear existing schemes
    await Scheme.deleteMany({});
    console.log('🗑️  Cleared existing schemes');

    // Insert new schemes
    const schemes = await Scheme.insertMany(schemesData);
    console.log(`✅ Successfully seeded ${schemes.length} government schemes`);

    // Log seeded schemes
    schemes.forEach(scheme => {
      console.log(`   - ${scheme.name} (${scheme.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding schemes:', error);
    throw error;
  }
}

module.exports = { seedSchemes };

// Run if called directly
if (require.main === module) {
  require('dotenv').config();

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('📡 Connected to MongoDB');
    await seedSchemes();
    console.log('🎉 Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
}