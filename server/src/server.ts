import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
dotenv.config();

// Import the routes
import routes from './routes/index.js';
import htmlRoutes from './routes/htmlRoutes.js'; // Import htmlRoutes

const app = express();

// Set up the port to use from environment variable or default to 4000
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files from the dist folder (after build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Implement middleware to connect the API routes
app.use('/api/weather', routes);

// Implement middleware to serve index.html for non-API requests
app.use(htmlRoutes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));