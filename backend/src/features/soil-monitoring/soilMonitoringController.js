const axios = require('axios');
const logger = require('../../core/logger');

// Get soil data for specific location
const getSoilData = async (req, res) => {
  try {
    const { lat, lon, depth = 30 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Call Agromonitoring Soil API
    const response = await axios.get(`${process.env.AGROMONITORING_BASE_URL}/soil`, {
      params: {
        lat,
        lon,
        depth,
        appid: process.env.AGROMONITORING_API_KEY,
      },
    });

    logger.info(`Soil data fetched for coordinates: ${lat}, ${lon}`, { service: 'soil-monitoring' });

    res.status(200).json({
      success: true,
      data: response.data,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      depth,
    });
  } catch (error) {
    logger.error('Error fetching soil data:', error, { service: 'soil-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil data',
      error: error.message,
    });
  }
};

// Get soil moisture data
const getSoilMoisture = async (req, res) => {
  try {
    const { lat, lon, start, end } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const response = await axios.get(`${process.env.AGROMONITORING_BASE_URL}/soil/history`, {
      params: {
        lat,
        lon,
        start: start || Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
        end: end || Math.floor(Date.now() / 1000),
        appid: process.env.AGROMONITORING_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      dateRange: { start, end },
    });
  } catch (error) {
    logger.error('Error fetching soil moisture data:', error, { service: 'soil-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil moisture data',
      error: error.message,
    });
  }
};

// Get soil temperature
const getSoilTemperature = async (req, res) => {
  try {
    const { lat, lon, depth = 10 } = req.query;

    const response = await axios.get(`${process.env.AGROMONITORING_BASE_URL}/soil/temperature`, {
      params: {
        lat,
        lon,
        depth,
        appid: process.env.AGROMONITORING_API_KEY,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      depth,
    });
  } catch (error) {
    logger.error('Error fetching soil temperature:', error, { service: 'soil-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil temperature',
      error: error.message,
    });
  }
};

// Get soil analysis recommendations
const getSoilAnalysis = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    // Get comprehensive soil data
    const [soilData, moistureData, temperatureData] = await Promise.all([
      axios.get(`${process.env.AGROMONITORING_BASE_URL}/soil`, {
        params: { lat, lon, appid: process.env.AGROMONITORING_API_KEY },
      }),
      axios.get(`${process.env.AGROMONITORING_BASE_URL}/soil/history`, {
        params: {
          lat,
          lon,
          start: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // 7 days ago
          end: Math.floor(Date.now() / 1000),
          appid: process.env.AGROMONITORING_API_KEY,
        },
      }),
      axios.get(`${process.env.AGROMONITORING_BASE_URL}/soil/temperature`, {
        params: { lat, lon, appid: process.env.AGROMONITORING_API_KEY },
      }),
    ]);

    // Generate recommendations based on soil data
    const recommendations = generateSoilRecommendations(
      soilData.data,
      moistureData.data,
      temperatureData.data
    );

    res.status(200).json({
      success: true,
      data: {
        soil: soilData.data,
        moisture: moistureData.data,
        temperature: temperatureData.data,
        recommendations,
      },
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
    });
  } catch (error) {
    logger.error('Error fetching soil analysis:', error, { service: 'soil-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil analysis',
      error: error.message,
    });
  }
};

// Generate soil recommendations based on data
const generateSoilRecommendations = (soilData, moistureData, temperatureData) => {
  const recommendations = {
    irrigation: '',
    fertilization: '',
    cropSelection: '',
    soilManagement: '',
  };

  // Analyze soil moisture
  if (moistureData && moistureData.length > 0) {
    const avgMoisture = moistureData.reduce((sum, item) => sum + item.moisture, 0) / moistureData.length;

    if (avgMoisture < 20) {
      recommendations.irrigation = 'Soil moisture is low. Consider immediate irrigation.';
    } else if (avgMoisture > 80) {
      recommendations.irrigation = 'Soil moisture is high. Reduce irrigation to prevent waterlogging.';
    } else {
      recommendations.irrigation = 'Soil moisture levels are optimal for most crops.';
    }
  }

  // Analyze soil temperature
  if (temperatureData && temperatureData.temperature) {
    const temp = temperatureData.temperature;

    if (temp < 10) {
      recommendations.cropSelection = 'Cool soil temperature. Consider cold-tolerant crops like wheat, barley.';
    } else if (temp > 35) {
      recommendations.cropSelection = 'Hot soil temperature. Focus on heat-tolerant crops and provide shade.';
    } else {
      recommendations.cropSelection = 'Soil temperature is suitable for most crops.';
    }
  }

  // Analyze soil composition
  if (soilData) {
    if (soilData.organic_matter && soilData.organic_matter < 2) {
      recommendations.fertilization = 'Low organic matter. Add compost or organic fertilizers.';
    }

    if (soilData.ph) {
      if (soilData.ph < 6) {
        recommendations.soilManagement = 'Acidic soil. Add lime to increase pH.';
      } else if (soilData.ph > 8) {
        recommendations.soilManagement = 'Alkaline soil. Add sulfur or organic matter to decrease pH.';
      } else {
        recommendations.soilManagement = 'Soil pH is within optimal range.';
      }
    }
  }

  return recommendations;
};

// Get soil sensors data (if available)
const getSoilSensors = async (req, res) => {
  try {
    const { farmId } = req.params;

    // This would typically connect to IoT soil sensors
    // For now, return mock sensor data
    const mockSensorData = {
      sensors: [
        {
          id: 'sensor_001',
          location: { lat: 28.6139, lon: 77.2090 },
          readings: {
            moisture: 45,
            temperature: 24,
            ph: 6.8,
            conductivity: 1.2,
            nitrogen: 25,
            phosphorus: 15,
            potassium: 180,
          },
          lastUpdated: new Date(),
          status: 'active',
        },
        {
          id: 'sensor_002',
          location: { lat: 28.6145, lon: 77.2095 },
          readings: {
            moisture: 52,
            temperature: 23,
            ph: 7.1,
            conductivity: 1.0,
            nitrogen: 30,
            phosphorus: 18,
            potassium: 195,
          },
          lastUpdated: new Date(),
          status: 'active',
        },
      ],
      farmId,
      averageConditions: {
        moisture: 48.5,
        temperature: 23.5,
        ph: 6.95,
        fertility: 'Good',
      },
    };

    res.status(200).json({
      success: true,
      data: mockSensorData,
    });
  } catch (error) {
    logger.error('Error fetching soil sensors data:', error, { service: 'soil-monitoring' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil sensors data',
      error: error.message,
    });
  }
};

module.exports = {
  getSoilData,
  getSoilMoisture,
  getSoilTemperature,
  getSoilAnalysis,
  getSoilSensors,
};