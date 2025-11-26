const Field = require('./field.model');
const Farm = require('../farm/farm.model');

class FieldService {
  async createField(fieldData, userId) {
    // Verify farm ownership
    const farm = await Farm.findOne({ _id: fieldData.farm, owner: userId });
    if (!farm) {
      throw new Error('Farm not found or access denied');
    }

    const field = await Field.create(fieldData);
    return field.populate('farm currentCrop');
  }

  async getAllFields(userId, { page = 1, limit = 10, farmId }) {
    const skip = (page - 1) * limit;
    const query = {};

    if (farmId) {
      // Verify farm ownership
      const farm = await Farm.findOne({ _id: farmId, owner: userId });
      if (!farm) {
        throw new Error('Farm not found or access denied');
      }
      query.farm = farmId;
    } else {
      // Get all user's farms
      const farms = await Farm.find({ owner: userId }).select('_id');
      query.farm = { $in: farms.map(f => f._id) };
    }

    const [fields, total] = await Promise.all([
      Field.find(query)
        .populate('farm', 'name')
        .populate('currentCrop', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Field.countDocuments(query)
    ]);

    return { fields, total };
  }

  async getFieldById(fieldId, userId) {
    const field = await Field.findById(fieldId)
      .populate('farm')
      .populate('currentCrop')
      .populate('cropHistory.crop');

    if (!field) {
      throw new Error('Field not found');
    }

    // Verify ownership through farm
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    if (!farm) {
      throw new Error('Access denied');
    }

    return field;
  }

  async updateField(fieldId, userId, updateData) {
    const field = await Field.findById(fieldId).populate('farm');

    if (!field) {
      throw new Error('Field not found');
    }

    // Verify ownership
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    if (!farm) {
      throw new Error('Access denied');
    }

    Object.assign(field, updateData);
    await field.save();

    return field.populate('currentCrop');
  }

  async deleteField(fieldId, userId) {
    const field = await Field.findById(fieldId).populate('farm');

    if (!field) {
      throw new Error('Field not found');
    }

    // Verify ownership
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    if (!farm) {
      throw new Error('Access denied');
    }

    await field.deleteOne();
    return field;
  }
}

module.exports = new FieldService();
