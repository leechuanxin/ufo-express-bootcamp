import moment from 'moment';
import { add, read, write } from './jsonFileStorage.js';
import { standardizeParam, validateSighting } from './util.js';

const FILENAME = './data.json';
const SUMMARY_CHAR_LIMIT = 100;
// 6 keys for city, state, date/time, shape, duration, story
const SIGHTING_EDIT_KEY_LENGTH = 6;

export const handleIndex = (request, response) => {
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
};

export const handleNewSighting = (request, response) => {
  const obj = {
    timeNow: moment().format('YYYY-MM-DDTHH:mm'),
  };
  response.render('newsighting', obj);
};

export const handleShapes = (request, response) => {
  read(FILENAME, (err, data) => {
    const { sightings } = data;
    const shapeTally = {};
    sightings.forEach((sighting) => {
      // get standardized str of shape from data.json
      const standardizedShape = standardizeParam(sighting.shape);
      // get current list of standardized shapes saved
      const standardizedShapesArr = Object.keys(shapeTally).map((shape) => standardizeParam(shape));
      if (standardizedShapesArr.indexOf(standardizedShape) < 0) {
        shapeTally[sighting.shape] = '';
      }
    });
    const obj = { shapes: Object.keys(shapeTally) };
    response.render('shapes', obj);
  });
};

export const handleShape = (request, response) => {
  read(FILENAME, (err, data) => {
    // clean up shapes data from JSON
    const { sightings } = data;
    const shapeTally = {};
    const sightingsIndexed = sightings.map((sighting, index) => ({
      ...sighting,
      idx: index,
    }));
    sightingsIndexed.forEach((sighting) => {
      // shapes from data.json to be lower-cased, no spaces
      const shape = standardizeParam(sighting.shape);
      if (!shapeTally[shape]) {
        shapeTally[shape] = '';
      }
    });
    const shapes = Object.keys(shapeTally);
    // shape from param to be lower-cased, no spaces
    const shapeParam = standardizeParam(request.params.shape);
    if (shapes.indexOf(shapeParam) < 0) {
      response.status(404).send('Sorry, we cannot find that shape!');
    } else {
      // retrieve all matching shapes
      const matchingSightings = sightingsIndexed
        .filter((sighting) => shapeParam === standardizeParam(sighting.shape));

      const obj = {
        sightings: matchingSightings,
      };
      response.render('shape', obj);
    }
  });
};

export const handleSighting = (request, response) => {
  read(FILENAME, (err, data) => {
    // page indexes/ids start from 1 instead of 0
    if (request.params.index > data.sightings.length || request.params.index < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      // page indexes/ids start from 1 instead of 0
      const sighting = data.sightings[request.params.index - 1];
      const sightingFmt = {
        ...sighting,
        idx: request.params.index,
        createdFmt: moment(sighting.created).format('MMMM DD, YYYY'),
        lastUpdatedFmt: moment(sighting.lastUpdated).format('MMMM DD, YYYY'),
        dateTimeFmt: moment(sighting.date_time).format('MMMM DD, YYYY hh:mmA'),
      };
      response.render('sighting', sightingFmt);
    }
  });
};

export const handleSightingEdit = (request, response) => {
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
      const sightingFmt = {
        ...sighting,
        idx: request.params.index,
        timeNow: moment().format('YYYY-MM-DDTHH:mm'),
      };
      response.render('editsighting', sightingFmt);
    }
  });
};

export const handleSightingEditPut = (request, response) => {
  const idxParam = request.params.index;
  const validatedSighting = validateSighting(request.body, response);
  if (Number.isNaN(Number(idxParam))) {
    response.status(406).send('Your sighting ID has to be a number!');
  } else if (
    validatedSighting
    && Object.keys(validatedSighting).length === SIGHTING_EDIT_KEY_LENGTH
  ) {
    read(FILENAME, (err, data) => {
      // page indexes/ids start from 1 instead of 0
      if (idxParam > data.sightings.length || idxParam < 1) {
        response.status(404).send('Sorry, we cannot find that!');
      } else {
        const textLength = validatedSighting.text.length;
        // page indexes/ids start from 1 instead of 0
        data.sightings[idxParam - 1] = {
          ...validatedSighting,
          summary: validatedSighting.text
            .substring(0, SUMMARY_CHAR_LIMIT)
            .concat(
              (textLength > SUMMARY_CHAR_LIMIT) ? '...' : '',
            ),
          created: data.sightings[idxParam - 1].created || new Date(),
          lastUpdated: new Date(),
        };
        write(FILENAME, data, (error) => {
          if (error) {
            response.status(500).send('DB write error. We cannot edit this sighting. Please try again!');
          }
          response.redirect(`/sighting/${idxParam}`);
        });
      }
    });
  }
};

export const handleSightingDelete = (request, response) => {
  const idxParam = request.params.index;
  if (Number.isNaN(Number(idxParam))) {
    response.status(406).send('Your sighting ID has to be a number!');
  } else {
    // Remove element from DB at given index
    read(FILENAME, (err, data) => {
      // page indexes/ids start from 1 instead of 0
      if (request.params.index > data.sightings.length || request.params.index < 1) {
        response.status(404).send('Sorry, we cannot find that!');
      } else {
        // page indexes/ids start from 1 instead of 0
        data.sightings.splice(idxParam - 1, 1);
        write(FILENAME, data, (error) => {
          if (!error) {
            response.redirect('/');
          } else {
            response.status(500).send('DB write error. We cannot delete this sighting. Please try again!');
          }
        });
      }
    });
  }
};

export const handleSightingCreate = (request, response) => {
  const textLength = request.body.text.length;
  const validatedSighting = validateSighting(request.body, response);
  if (validatedSighting && Object.keys(validatedSighting).length === SIGHTING_EDIT_KEY_LENGTH) {
    const sighting = {
      ...validatedSighting,
      summary: validatedSighting.text
        .substring(0, SUMMARY_CHAR_LIMIT)
        .concat(
          (textLength > SUMMARY_CHAR_LIMIT) ? '...' : '',
        ),
      created: new Date(),
      lastUpdated: new Date(),
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
  }
};
