import { useState, useEffect } from 'react';
import weatherService from '../services/weatherService';

export const useWeather = (city) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  const fetchWeather = async (location) => {
    try {
      setLoading(true);
      setError(null);
      const result = await weatherService.getCurrentWeather(location);
      
      if (result.success) {
        const parsedData = weatherService.parseWeatherData(result.data);
        setWeather(parsedData);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    if (city) {
      fetchWeather(city);
    }
  };

  return { weather, loading, error, refresh, fetchWeather };
};

export default useWeather;
