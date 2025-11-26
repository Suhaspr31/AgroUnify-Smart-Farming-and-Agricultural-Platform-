const Crop = require('./crop.model');
const Field = require('../field/field.model');
const Farm = require('../farm/farm.model');

class CropService {
  async createCrop(cropData, userId) {
    // Verify field ownership
    const field = await Field.findById(cropData.field).populate('farm');
    if (!field) {
      throw new Error('Field not found');
    }

    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    if (!farm) {
      throw new Error('Access denied');
    }

    // Update field's current crop
    field.currentCrop = null; // Will be updated after crop creation
    await field.save();

    const crop = await Crop.create(cropData);
    
    // Update field with new crop
    field.currentCrop = crop._id;
    await field.save();

    return crop.populate('field farmer');
  }

  async getAllCrops(userId, { page = 1, limit = 10, fieldId, stage, isHarvested }) {
    const skip = (page - 1) * limit;

    // Get user's farms
    const farms = await Farm.find({ owner: userId }).select('_id');
    const farmIds = farms.map(f => f._id);

    // Get fields from user's farms
    const fields = await Field.find({ farm: { $in: farmIds } }).select('_id');
    const fieldIds = fields.map(f => f._id);

    // Build query
    const query = { field: { $in: fieldIds } };

    if (fieldId) {
      query.field = fieldId;
    }

    if (stage) {
      query.stage = stage;
    }

    if (isHarvested !== undefined) {
      query.isHarvested = isHarvested === 'true';
    }

    const [crops, total] = await Promise.all([
      Crop.find(query)
        .populate('field', 'name area')
        .populate('farmer', 'name email')
        .sort({ plantingDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Crop.countDocuments(query)
    ]);

    return { crops, total };
  }

  async getCropById(cropId, userId) {
    const crop = await Crop.findById(cropId)
      .populate('field')
      .populate('farmer', 'name email');

    if (!crop) {
      throw new Error('Crop not found');
    }

    // Verify ownership
    const field = await Field.findById(crop.field._id).populate('farm');
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    
    if (!farm) {
      throw new Error('Access denied');
    }

    return crop;
  }

  async updateCrop(cropId, userId, updateData) {
    const crop = await Crop.findById(cropId).populate('field');

    if (!crop) {
      throw new Error('Crop not found');
    }

    // Verify ownership
    const field = await Field.findById(crop.field._id).populate('farm');
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    
    if (!farm) {
      throw new Error('Access denied');
    }

    Object.assign(crop, updateData);
    await crop.save();

    return crop;
  }

  async deleteCrop(cropId, userId) {
    const crop = await Crop.findById(cropId).populate('field');

    if (!crop) {
      throw new Error('Crop not found');
    }

    // Verify ownership
    const field = await Field.findById(crop.field._id).populate('farm');
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    
    if (!farm) {
      throw new Error('Access denied');
    }

    // Remove from field's current crop
    if (field.currentCrop && field.currentCrop.toString() === cropId) {
      field.currentCrop = null;
      await field.save();
    }

    await crop.deleteOne();
    return crop;
  }

  async addActivity(cropId, userId, activityData) {
    const crop = await Crop.findById(cropId).populate('field');

    if (!crop) {
      throw new Error('Crop not found');
    }

    // Verify ownership
    const field = await Field.findById(crop.field._id).populate('farm');
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    
    if (!farm) {
      throw new Error('Access denied');
    }

    crop.activities.push(activityData);
    await crop.save();

    return crop;
  }

  async getCropStats(cropId, userId) {
    const crop = await Crop.findById(cropId).populate('field');

    if (!crop) {
      throw new Error('Crop not found');
    }

    // Verify ownership
    const field = await Field.findById(crop.field._id).populate('farm');
    const farm = await Farm.findOne({ _id: field.farm._id, owner: userId });
    
    if (!farm) {
      throw new Error('Access denied');
    }

    // Calculate statistics
    const totalActivities = crop.activities.length;
    const totalCost = crop.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
    
    const daysPlanted = Math.floor(
      (new Date() - new Date(crop.plantingDate)) / (1000 * 60 * 60 * 24)
    );

    return {
      crop: {
        name: crop.name,
        stage: crop.stage,
        health: crop.health
      },
      timeline: {
        daysPlanted,
        plantingDate: crop.plantingDate,
        expectedHarvestDate: crop.expectedHarvestDate
      },
      activities: {
        total: totalActivities,
        totalCost
      },
      yield: {
        expected: crop.expectedYield,
        actual: crop.actualYield,
        unit: crop.yieldUnit
      }
    };
  }
}

module.exports = new CropService();
