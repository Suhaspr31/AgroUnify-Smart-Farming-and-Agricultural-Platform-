const axios = require('axios');

const getWeatherData = async (lat, lng) => {
  // Location-based mock weather data for Indian regions
  console.log('Getting weather data for location:', lat, lng);

  let temperature, rainfall;

  // Northern India (Haryana, Punjab, UP, Delhi) - Cooler, wheat belt
  if (lat >= 28 && lat <= 32 && lng >= 75 && lng <= 82) {
    temperature = 18; // Cooler temperature suitable for wheat
    rainfall = 400; // Moderate rainfall
  }
  // Southern India (Karnataka, Tamil Nadu, Kerala) - Tropical
  else if (lat >= 8 && lat <= 15 && lng >= 74 && lng <= 80) {
    temperature = 28; // Warmer temperature
    rainfall = 800; // Higher rainfall, suitable for rice/maize
  }
  // Western India (Maharashtra, Gujarat) - Semi-arid
  else if (lat >= 16 && lat <= 22 && lng >= 72 && lng <= 78) {
    temperature = 30; // Hot
    rainfall = 600; // Moderate rainfall
  }
  // Eastern India (West Bengal, Odisha) - Humid
  else if (lat >= 20 && lat <= 26 && lng >= 82 && lng <= 88) {
    temperature = 26; // Moderate
    rainfall = 1500; // High rainfall
  }
  // Central India (MP, Chhattisgarh) - Mixed
  else if (lat >= 18 && lat <= 25 && lng >= 78 && lng <= 85) {
    temperature = 27; // Moderate
    rainfall = 1000; // Good rainfall
  }
  // Default for other areas
  else {
    temperature = 25;
    rainfall = 700;
  }

  const result = {
    temperature: temperature,
    rainfall: rainfall
  };
  console.log('Weather data result:', result);
  return result;
};

const getWeatherDataOld = async (lat, lng) => {
  // OpenWeatherMap API call
  const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

  const response = await axios.get(weatherUrl);
  const weatherData = response.data;

  return {
    temperature: weatherData.main.temp,
    rainfall: weatherData.rain ? weatherData.rain['1h'] || 0 : 0
  };
};

const getSoilData = async (lat, lng) => {
  // Location-based mock soil data for Indian regions
  console.log('Getting soil data for location:', lat, lng);

  let ph, nitrogen, phosphorus, potassium;

  // Northern India (Alluvial plains) - Fertile alluvial soil
  if (lat >= 28 && lat <= 32 && lng >= 75 && lng <= 82) {
    ph = 7.2; // Slightly alkaline
    nitrogen = 90; // High fertility
    phosphorus = 45;
    potassium = 40;
  }
  // Southern India (Red and black soil regions)
  else if (lat >= 8 && lat <= 15 && lng >= 74 && lng <= 80) {
    ph = 6.8; // Slightly acidic to neutral
    nitrogen = 70; // Moderate fertility
    phosphorus = 35;
    potassium = 30;
  }
  // Western India (Black cotton soil)
  else if (lat >= 16 && lat <= 22 && lng >= 72 && lng <= 78) {
    ph = 7.5; // Alkaline
    nitrogen = 60; // Lower fertility
    phosphorus = 30;
    potassium = 25;
  }
  // Eastern India (Alluvial and lateritic soil)
  else if (lat >= 20 && lat <= 26 && lng >= 82 && lng <= 88) {
    ph = 6.2; // Slightly acidic
    nitrogen = 85; // Good fertility
    phosphorus = 40;
    potassium = 35;
  }
  // Central India (Mixed soil types)
  else if (lat >= 18 && lat <= 25 && lng >= 78 && lng <= 85) {
    ph = 6.5; // Neutral
    nitrogen = 75; // Moderate
    phosphorus = 38;
    potassium = 32;
  }
  // Default for other areas
  else {
    ph = 6.5;
    nitrogen = 80;
    phosphorus = 40;
    potassium = 35;
  }

  const result = {
    ph: ph,
    nitrogen: nitrogen,
    phosphorus: phosphorus,
    potassium: potassium
  };
  console.log('Soil data result:', result);
  return result;

  // Uncomment below for actual API integration
  /*
  const phUrl = `https://api.openlandmap.org/query/point?lat=${lat}&lng=${lng}&layer=ph_soil`;
  const nitrogenUrl = `https://api.openlandmap.org/query/point?lat=${lat}&lng=${lng}&layer=nitrogen_soil`;
  const phosphorusUrl = `https://api.openlandmap.org/query/point?lat=${lat}&lng=${lng}&layer=phosphorus_soil`;
  const potassiumUrl = `https://api.openlandmap.org/query/point?lat=${lat}&lng=${lng}&layer=potassium_soil`;

  const [phResponse, nResponse, pResponse, kResponse] = await Promise.all([
    axios.get(phUrl),
    axios.get(nitrogenUrl),
    axios.get(phosphorusUrl),
    axios.get(potassiumUrl)
  ]);

  return {
    ph: phResponse.data.value || 6.5,
    nitrogen: nResponse.data.value || 80,
    phosphorus: pResponse.data.value || 40,
    potassium: kResponse.data.value || 35
  };
  */
};

const getCropRecommendation = async (location) => {
  const { lat, lng } = location;

  // Fetch weather and soil data
  const [weatherData, soilData] = await Promise.all([
    getWeatherData(lat, lng),
    getSoilData(lat, lng)
  ]);

  // Combine data for AI service
  const inputData = {
    temperature: weatherData.temperature,
    rainfall: weatherData.rainfall,
    ph: soilData.ph,
    nitrogen: soilData.nitrogen,
    phosphorus: soilData.phosphorus,
    potassium: soilData.potassium
  };

  // Call AI microservice
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1';
  console.log('Calling AI service at:', `${aiServiceUrl}/predict_crop`);
  console.log('Input data:', inputData);
  try {
    const response = await axios.post(`${aiServiceUrl}/predict_crop`, inputData);
    console.log('AI service response:', response.data);
    return {
      location: { lat, lng },
      inputData,
      recommended_crop: response.data.recommended_crop
    };
  } catch (aiError) {
    console.error('AI service error:', aiError.message);
    // For demo purposes, return a mock recommendation if AI service fails
    return {
      location: { lat, lng },
      inputData,
      recommended_crop: 'Rice'
    };
  }

  return {
    location: { lat, lng },
    inputData,
    recommended_crop: response.data.recommended_crop
  };
};

module.exports = {
  getCropRecommendation
};