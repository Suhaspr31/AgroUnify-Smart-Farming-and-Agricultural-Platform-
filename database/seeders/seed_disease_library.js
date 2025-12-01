const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Since we're running from backend directory, adjust the path
const DiseaseLibrary = require('./src/features/crop/disease.library.model');

require('dotenv').config();

async function seedDiseaseLibrary() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrounify', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Read the disease library data
    const diseaseDataPath = path.join(__dirname, 'disease_library.json');
    const diseaseData = JSON.parse(fs.readFileSync(diseaseDataPath, 'utf8'));

    console.log(`Found ${diseaseData.length} diseases to seed`);

    // Clear existing data
    await DiseaseLibrary.deleteMany({});
    console.log('Cleared existing disease library data');

    // Insert new data
    const insertedDiseases = await DiseaseLibrary.insertMany(diseaseData);
    console.log(`Successfully seeded ${insertedDiseases.length} diseases`);

    // Create indexes for better performance
    await DiseaseLibrary.createIndexes();
    console.log('Created database indexes');

    console.log('Disease library seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding disease library:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDiseaseLibrary();
}

module.exports = seedDiseaseLibrary;