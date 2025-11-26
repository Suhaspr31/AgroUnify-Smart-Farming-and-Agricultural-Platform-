const Farm = require('./farm.model');
const Field = require('../field/field.model');

class FarmService {
  async createFarm(farmData) {
    const farm = await Farm.create(farmData);
    return farm;
  }

  async getAllFarms(userId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const [farms, total] = await Promise.all([
      Farm.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('owner', 'name email'),
      Farm.countDocuments({ owner: userId })
    ]);

    return { farms, total };
  }

  async getFarmById(farmId, userId) {
    const farm = await Farm.findOne({ _id: farmId, owner: userId })
      .populate('owner', 'name email')
      .populate('fields');

    if (!farm) {
      throw new Error('Farm not found');
    }

    return farm;
  }

  async updateFarm(farmId, userId, updateData) {
    const farm = await Farm.findOneAndUpdate(
      { _id: farmId, owner: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!farm) {
      throw new Error('Farm not found');
    }

    return farm;
  }

  async deleteFarm(farmId, userId) {
    const farm = await Farm.findOneAndDelete({ _id: farmId, owner: userId });

    if (!farm) {
      throw new Error('Farm not found');
    }

    // Delete associated fields
    await Field.deleteMany({ farm: farmId });

    return farm;
  }

  async getFarmStats(farmId, userId) {
    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      throw new Error('Farm not found');
    }

    // Get field statistics
    const fields = await Field.find({ farm: farmId });
    const totalFields = fields.length;
    const activeFields = fields.filter(f => f.isActive).length;

    return {
      farm: {
        name: farm.name,
        totalArea: farm.totalArea,
        areaUnit: farm.areaUnit
      },
      fields: {
        total: totalFields,
        active: activeFields
      }
    };
  }
}

module.exports = new FarmService();
