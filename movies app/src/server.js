const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const mongoUsername = process.env.DB_USERNAME || 'db-user';
const mongoPassword = process.env.DB_PASSWORD || 'password123';
const mongoUri = `mongodb://${encodeURIComponent(mongoUsername)}:${encodeURIComponent(mongoPassword)}@mongodb:27017/sample_mflix`;
console.log(`Attempting to connect to ${mongoUri}...`);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Display success or failure messages
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.log("Failed to connect to MongoDB.");
});

db.once('open', () => {
  console.log("Successfully connected to MongoDB.");
});
// Movie Schema
const movieSchema = new mongoose.Schema({
  title: String,
  year: Number,
  runtime: Number,
  genres: [String],
  cast: [String],
});
const Movie = mongoose.model('Movie', movieSchema);

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add Movie Page
app.get('/addmovie', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'addmovie.html'));
});

app.post('/addmovie', async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List Movies Page
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Movie Page
app.get('/deletemovie', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deletemovie.html'));
});

app.post('/deletemovie', async (req, res) => {
  const { title } = req.body;
  try {
    await Movie.deleteOne({ title });
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Movie Page
app.get('/updatemovie', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'updatemovie.html'));
});

app.post('/updatemovie', async (req, res) => {
  const { title } = req.body;
  try {
    await Movie.findOneAndUpdate({ title }, req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find Movie Page
app.get('/findmovie', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'findmovie.html'));
});

app.post('/findmovie', async (req, res) => {
  const { title } = req.body;
  try {
    const movie = await Movie.findOne({ title });
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Movie not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
