import express from 'express';

const app = express();
const PORT = process.argv[2];
const FILENAME = './data.json';

// Set view engine
app.set('view engine', 'ejs');

app.get('/sighting', (request, response) => {
  response.render('sighting');
});

app.listen(PORT);
