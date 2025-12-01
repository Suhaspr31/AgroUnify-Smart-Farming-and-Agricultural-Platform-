const DiseaseLibrary = require('./disease.library.model');

class DiseaseLibraryService {
  // Get disease information by disease key
  async getDiseaseByKey(diseaseKey) {
    try {
      const disease = await DiseaseLibrary.findOne({ disease_key: diseaseKey });
      return disease;
    } catch (error) {
      console.error('Error fetching disease by key:', error);
      throw new Error('Failed to fetch disease information');
    }
  }

  // Get disease information by name and crop type
  async getDiseaseByName(diseaseName, cropType) {
    try {
      const disease = await DiseaseLibrary.findOne({
        disease_name: { $regex: diseaseName, $options: 'i' },
        crop_type: cropType
      });
      return disease;
    } catch (error) {
      console.error('Error fetching disease by name:', error);
      throw new Error('Failed to fetch disease information');
    }
  }

  // Get all diseases for a specific crop
  async getDiseasesByCrop(cropType) {
    try {
      const diseases = await DiseaseLibrary.find({ crop_type: cropType });
      return diseases;
    } catch (error) {
      console.error('Error fetching diseases by crop:', error);
      throw new Error('Failed to fetch diseases for crop');
    }
  }

  // Search diseases by symptoms
  async searchBySymptoms(symptoms) {
    try {
      const diseases = await DiseaseLibrary.find({
        symptoms: { $in: symptoms }
      });
      return diseases;
    } catch (error) {
      console.error('Error searching diseases by symptoms:', error);
      throw new Error('Failed to search diseases by symptoms');
    }
  }

  // Get diseases by pathogen type
  async getDiseasesByPathogenType(pathogenType) {
    try {
      const diseases = await DiseaseLibrary.find({ pathogen_type: pathogenType });
      return diseases;
    } catch (error) {
      console.error('Error fetching diseases by pathogen type:', error);
      throw new Error('Failed to fetch diseases by pathogen type');
    }
  }

  // Add new disease to library
  async addDisease(diseaseData) {
    try {
      const disease = new DiseaseLibrary(diseaseData);
      await disease.save();
      return disease;
    } catch (error) {
      console.error('Error adding disease:', error);
      throw new Error('Failed to add disease to library');
    }
  }

  // Update disease information
  async updateDisease(diseaseKey, updateData) {
    try {
      const disease = await DiseaseLibrary.findOneAndUpdate(
        { disease_key: diseaseKey },
        { ...updateData, last_updated: new Date() },
        { new: true, runValidators: true }
      );
      return disease;
    } catch (error) {
      console.error('Error updating disease:', error);
      throw new Error('Failed to update disease information');
    }
  }

  // Delete disease from library
  async deleteDisease(diseaseKey) {
    try {
      const result = await DiseaseLibrary.findOneAndDelete({ disease_key: diseaseKey });
      return result;
    } catch (error) {
      console.error('Error deleting disease:', error);
      throw new Error('Failed to delete disease from library');
    }
  }

  // Get all diseases with pagination
  async getAllDiseases(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const diseases = await DiseaseLibrary.find()
        .skip(skip)
        .limit(limit)
        .sort({ disease_name: 1 });
      const total = await DiseaseLibrary.countDocuments();
      return {
        diseases,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalDiseases: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching all diseases:', error);
      throw new Error('Failed to fetch diseases');
    }
  }

  // Get disease statistics
  async getDiseaseStats() {
    try {
      const stats = await DiseaseLibrary.aggregate([
        {
          $group: {
            _id: null,
            totalDiseases: { $sum: 1 },
            byCrop: {
              $push: '$crop_type'
            },
            byPathogen: {
              $push: '$pathogen_type'
            }
          }
        },
        {
          $project: {
            totalDiseases: 1,
            cropTypes: { $setUnion: ['$byCrop'] },
            pathogenTypes: { $setUnion: ['$byPathogen'] }
          }
        }
      ]);

      return stats[0] || { totalDiseases: 0, cropTypes: [], pathogenTypes: [] };
    } catch (error) {
      console.error('Error fetching disease statistics:', error);
      throw new Error('Failed to fetch disease statistics');
    }
  }
}

module.exports = new DiseaseLibraryService();