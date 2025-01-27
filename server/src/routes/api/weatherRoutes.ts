import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // For making API requests

const router = Router();

// Path to the search history file
const filePath = path.join(__dirname, '../data/searchHistory.json');

// Helper function to read the searchHistory.json file
function readSearchHistory() {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Helper function to write to the searchHistory.json file
function writeSearchHistory(history: any) {
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
}

// Route: GET /api/weather/history
router.get('/history', (req, res) => {
  try {
    const history = readSearchHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read search history.' });
  }
});

// Route: POST /api/weather
router.post('/', async (req, res) => {
  try {
    const { city } = req.body; // Expecting a city name in the request body
    if (!city) {
      return res.status(400).json({ error: 'City name is required.' });
    }

    // Save city to search history
    const history = readSearchHistory();
    const newCity = { id: history.length + 1, city };
    history.push(newCity);
    writeSearchHistory(history);

    // Get weather data from OpenWeather API
    const apiKey = process.env.OPENWEATHER_API_KEY; // Make sure your .env file has this key
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (geoData.length === 0) {
      return res.status(404).json({ error: 'City not found.' });
    }

    const { lat, lon } = geoData[0];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    res.json(weatherData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve weather data.' });
  }
});

export default router;