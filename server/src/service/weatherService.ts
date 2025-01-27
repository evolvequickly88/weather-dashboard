import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Interface for the Coordinates object (latitude and longitude)
interface Coordinates {
  lat: number;
  lon: number;
}

// Interface for the Weather object (for current weather and forecast)
interface Weather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

// WeatherService class to manage weather data
class WeatherService {
  // Base URL for OpenWeather API
  private baseURL = 'https://api.openweathermap.org/data/2.5/';

  // API key from the environment variables
  private apiKey = process.env.OPENWEATHER_API_KEY;

  // Remove the 'cityName' property

  // Fetch location data (geo data) from OpenWeather API using the city name
  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    const geoUrl = this.buildGeocodeQuery(query); // Call the buildGeocodeQuery method
    const response = await fetch(geoUrl);
    const data = await response.json() as { lat: number; lon: number }[];
    if (data.length === 0) return null;
    const { lat, lon } = data[0];
    return { lat, lon };
  }

  // Destructure location data (Coordinates)
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // Remove the unused method

  // Build the weather query URL using coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch and destructure location data (coordinates)
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates | null> {
    const locationData = await this.fetchLocationData(city);
    if (!locationData) throw new Error('City not found');
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data based on coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherUrl = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherUrl);
    return await response.json();
  }

  // Parse the current weather data
  private parseCurrentWeather(response: any): Weather {
    const weather = response.list[0]; // Get current weather data (the first element in the list)
    return {
      temperature: weather.main.temp,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
    };
  }

  // Build the forecast array (5 days forecast)
  private buildForecastArray(weatherData: any[]): Weather[] {
    return weatherData.map((weather) => ({
      temperature: weather.main.temp,
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
    }));
  }

  // Get weather for a specific city
  async getWeatherForCity(city: string): Promise<any> {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      if (coordinates) {
        await this.fetchWeatherData(coordinates);
      } else {
        throw new Error('Coordinates not found');
      }
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastWeather = this.buildForecastArray(currentWeather, weatherData.list.slice(1, 6)); // Get next 5 days

      return {
        currentWeather,
        forecastWeather,
      };
    } catch (err) {
      console.error(err);
      throw new Error('Error retrieving weather data');
    }
  }
}

export default new WeatherService();