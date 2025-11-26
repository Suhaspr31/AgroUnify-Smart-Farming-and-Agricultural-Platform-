const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../../src/app');
const User = require('../../../../src/models/User');
const Crop = require('../../../../src/models/Crop');

describe('Crops API Integration Tests', () => {
  let farmer, token, sampleCrop;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean database
    await User.deleteMany({});
    await Crop.deleteMany({});
    
    // Create test farmer
    farmer = new User({
      name: 'Test Farmer',
      email: 'farmer@example.com',
      password: 'Password123',
      phone: '+919876543210',
      role: 'farmer'
    });
    await farmer.save();
    token = farmer.generateAuthToken();

    // Create sample crop
    sampleCrop = new Crop({
      name: 'Test Wheat',
      variety: 'HD-2967',
      farmer: farmer._id,
      plantingDate: new Date(),
      expectedHarvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      fieldDetails: {
        area: 2.5,
        location: {
          city: 'Test City',
          state: 'Test State'
        },
        soilType: 'loamy',
        irrigationType: 'drip'
      }
    });
    await sampleCrop.save();
  });

  describe('POST /api/crops', () => {
    it('should create a new crop', async () => {
      const cropData = {
        name: 'New Rice',
        variety: 'Basmati 1121',
        plantingDate: new Date().toISOString(),
        expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        fieldDetails: {
          area: 3.0,
          location: {
            city: 'New City',
            state: 'New State'
          },
          soilType: 'clay',
          irrigationType: 'flood'
        }
      };

      const response = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${token}`)
        .send(cropData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.crop.name).toBe(cropData.name);
      expect(response.body.data.crop.farmer).toBe(farmer._id.toString());
    });

    it('should not create crop without authentication', async () => {
      const cropData = {
        name: 'Unauthorized Crop',
        variety: 'Test Variety'
      };

      const response = await request(app)
        .post('/api/crops')
        .send(cropData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/crops', () => {
    it('should get farmer\'s crops', async () => {
      const response = await request(app)
        .get('/api/crops')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.crops).toHaveLength(1);
      expect(response.body.data.crops[0].name).toBe(sampleCrop.name);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/crops?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.current).toBe(1);
    });
  });

  describe('GET /api/crops/:id', () => {
    it('should get specific crop', async () => {
      const response = await request(app)
        .get(`/api/crops/${sampleCrop._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.crop._id).toBe(sampleCrop._id.toString());
    });

    it('should not get crop with invalid ID', async () => {
      const response = await request(app)
        .get('/api/crops/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/crops/:id', () => {
    it('should update crop', async () => {
      const updateData = {
        currentStage: 'flowering',
        healthStatus: 'healthy'
      };

      const response = await request(app)
        .put(`/api/crops/${sampleCrop._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.crop.currentStage).toBe(updateData.currentStage);
    });
  });

  describe('DELETE /api/crops/:id', () => {
    it('should delete crop (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/crops/${sampleCrop._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify soft delete
      const deletedCrop = await Crop.findById(sampleCrop._id);
      expect(deletedCrop.isActive).toBe(false);
    });
  });

  describe('GET /api/crops/analytics', () => {
    it('should get crop analytics', async () => {
      const response = await request(app)
        .get('/api/crops/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.overview).toBeDefined();
    });
  });
});