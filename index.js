import express from 'express';
import methodOverride from 'method-override';
import { add, read, write } from './jsonFileStorage.js';

const app = express();
const PORT = process.argv[2];
const FILENAME = './data.json';
const SUMMARY_CHAR_LIMIT = 100;

// Set view engine
app.set('view engine', 'ejs');
// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));
// To receive POST request body data in request.body
app.use(express.urlencoded({ extended: false }));

app.get('/', (request, response) => {
  read(FILENAME, (err, data) => {
    const { sightings } = data;
    const sightingsIdx = sightings
      .map(
        // page indexes/ids start from 1 instead of 0
        (sighting, index) => ({ ...sighting, idx: index + 1 }),
      );
    const sightingsIdxObj = {
      sightings: sightingsIdx,
    };
    response.render('index', sightingsIdxObj);
  });
});

app.get('/sighting', (request, response) => {
  response.render('newsighting');
});

app.get('/sighting/:index', (request, response) => {
  read(FILENAME, (err, data) => {
    // page indexes/ids start from 1 instead of 0
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

app.get('/sighting/:index/edit', (request, response) => {
  const idxParam = request.params.index;
  if (Number.isNaN(Number(idxParam))) {
    response.status(406).send('Your sighting ID has to be a number!');
  }
  read(FILENAME, (err, data) => {
    // page indexes/ids start from 1 instead of 0
    if (request.params.index > data.sightings.length || request.params.index < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      // page indexes/ids start from 1 instead of 0
      const sighting = data.sightings[request.params.index - 1];
      const sightingWithIndex = {
        ...sighting,
        idx: request.params.index,
      };
      response.render('editsighting', sightingWithIndex);
    }
  });
});

app.put('/sighting/:index/edit', (request, response) => {
  const idxParam = request.params.index;
  if (Number.isNaN(Number(idxParam))) {
    response.status(406).send('Your sighting ID has to be a number!');
  }
  read(FILENAME, (err, data) => {
    if (request.params.index > data.sightings.length || request.params.index < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      const textLength = request.body.text.length;
      // page indexes/ids start from 1 instead of 0
      data.sightings[request.params.index - 1] = {
        ...request.body,
        summary: request.body.text
          .substring(0, SUMMARY_CHAR_LIMIT)
          .concat(
            (textLength > SUMMARY_CHAR_LIMIT) ? '...' : '',
          ),
      };
      write(FILENAME, data, (error) => {
        if (error) {
          response.status(500).send('DB write error. We cannot edit this sighting. Please try again!');
        }
        response.redirect(`/sighting/${request.params.index}`);
      });
    }
  });
});

app.post('/sighting', (request, response) => {
  const textLength = request.body.text.length;
  const sighting = {
    ...request.body,
    summary: request.body.text
      .substring(0, SUMMARY_CHAR_LIMIT)
      .concat(
        (textLength > SUMMARY_CHAR_LIMIT) ? '...' : '',
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
