import express from 'express';
import { add } from './jsonFileStorage.js';

const app = express();
const PORT = process.argv[2];
const FILENAME = './data.json';

// Set view engine
app.set('view engine', 'ejs');
// To receive POST request body data in request.body
app.use(express.urlencoded({ extended: false }));

app.get('/sighting', (request, response) => {
  response.render('sighting');
});

app.post('/sighting', (request, response) => {
  const textLength = request.body.text.length;
  const sighting = {
    ...request.body,
    summary: request.body.text
      .substring(0, 150)
      .concat(
        (textLength > 150) ? '...' : '',
      ),
  };
  // Add new recipe data in request.body to recipes array in data.json.
  add(FILENAME, 'sightings', sighting, (err, str) => {
    if (err) {
      response.status(500).send('DB write error.');
      return;
    }

    console.log('Successful creation of new sighting.');
    console.log('Sighting:', sighting);

    response.status(200).send('Submitted successfully!');
  });
});

app.listen(PORT);
