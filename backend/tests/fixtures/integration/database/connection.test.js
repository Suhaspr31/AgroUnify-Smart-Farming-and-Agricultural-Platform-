const mongoose = require('mongoose');

describe('Database Connection Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should have correct database name', () => {
    expect(mongoose.connection.name).toContain('test');
  });

  it('should be able to create collections', async () => {
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'data' });
    
    const doc = await testCollection.findOne({ test: 'data' });
    expect(doc.test).toBe('data');
    
    await testCollection.deleteOne({ test: 'data' });
  });
});