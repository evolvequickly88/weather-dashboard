import fs from 'fs';
import path from 'path';

// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

// Path to the search history file
const filePath = path.join(__dirname, '../data/searchHistory.json');

// HistoryService class to manage city history
class HistoryService {
  // Read the searchHistory.json file
  private async read(): Promise<City[]> {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  // Write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    fs.writeFileSync(filePath, JSON.stringify(cities, null, 2));
  }

  // Get cities from the searchHistory.json file and return them as an array of City objects
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Add a new city to the searchHistory.json file
  async addCity(city: string): Promise<void> {
    const cities = await this.getCities();
    const newCity = new City((cities.length + 1).toString(), city); // Creating a new city with an id
    cities.push(newCity);
    await this.write(cities);
  }

  // Remove a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    let cities = await this.getCities();
    cities = cities.filter((city) => city.id !== id); // Filter out the city with the matching id
    await this.write(cities);
  }
}

// Export the HistoryService instance
export default new HistoryService();