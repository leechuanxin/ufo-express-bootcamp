import express from 'express';
import { add, read } from './jsonFileStorage.js';

const app = express();
const PORT = process.argv[2];
const FILENAME = './data.json';

// Set view engine
app.set('view engine', 'ejs');
// To receive POST request body data in request.body
app.use(express.urlencoded({ extended: false }));

app.get('/', (request, response) => {
  read(FILENAME, (err, data) => {
    const { sightings } = data;
    const sightingsIdx = sightings
      .map(
        (sighting, index) => ({ ...sighting, idx: index + 1 }),
      );
    const sightingsIdxObj = {
      sightings: sightingsIdx,
    };
    console.log(sightingsIdxObj);
    response.render('index', sightingsIdxObj);
  });
});

app.get('/sighting', (request, response) => {
  response.render('newsighting');
});

app.get('/sighting/:index', (request, response) => {
  read(FILENAME, (err, data) => {
    if (request.params.index > data.sightings.length || request.params.index < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      // page indexes/ids start from 1 instead of 0
      const sighting = data.sightings[request.params.index - 1];
      const sightingWithIndex = {
        ...sighting,
        idx: request.params.index,
      };
      response.render('sighting', sightingWithIndex);
    }
  });
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

    const obj = JSON.parse(str);
    // page indexes/ids start from 1 instead of 0
    const idx = obj.sightings.length;
    response.redirect(`/sighting/${idx}`);
  });
});

app.listen(PORT);
