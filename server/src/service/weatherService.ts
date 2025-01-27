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

  // City name property (optional if passed dynamically)
  private cityName: string;

  constructor() {
    this.cityName = '';
  }

  // Fetch location data (geo data) from OpenWeather API using the city name
  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    const geoUrl = `${this.baseURL}geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await fetch(geoUrl);
    const data = await response.json();
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

  // Build the geocode query URL
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

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
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
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
      const weatherData = await this.fetchWeatherData(coordinates);
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