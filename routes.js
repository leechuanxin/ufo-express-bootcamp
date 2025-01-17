import moment from 'moment';
import * as filestorage from './jsonFileStorage.js';
import * as util from './util.js';
import validateSighting from './validation.js';

const FILENAME = './data.json';

export const handleIndex = (request, response) => {
  filestorage.read(FILENAME, (err, data) => {
    if (!err) {
      const { sightings } = data;
      // page indexes/ids start from 1 instead of 0
      const sightingsFmt = util.getIndexedSightings(sightings, 1).map((sighting) => ({
        ...sighting,
        createdFmt: moment(sighting.created).format('dddd, MMMM Do, YYYY'),
      }));

      // visits cookie
      let visits = 0;
      // check if it's not the first time a request has been made
      if (request.cookies.visits) {
        visits = Number(request.cookies.visits); // get the value from the request
      }
      // set a new value of the cookie
      visits += 1;
      response.cookie('visits', visits); // set a new value to send back

      // split array
      const arrayToSplit = [...sightingsFmt];
      const latest = arrayToSplit.splice(arrayToSplit.length - 3);

      response.render('index', {
        latest: latest.reverse(),
        sightings: arrayToSplit.reverse(),
        visits,
      });
    } else {
      response.status(500).send('DB read error. We cannot access this page. Please try again!');
    }
  });
};

export const handleNewSighting = (request, response) => {
  const obj = {
    timeNow: moment().format('YYYY-MM-DDTHH:mm'),
  };
  response.render('editsighting', {
    sighting: obj,
    type: 'new',
  });
};

export const handleShapes = (request, response) => {
  filestorage.read(FILENAME, (err, data) => {
    const { sightings } = data;
    const uniqueShapesList = util.getUniqueShapesList(sightings);
    const obj = { shapes: uniqueShapesList };
    response.render('shapes', obj);
  });
};

export const handleShape = (request, response) => {
  filestorage.read(FILENAME, (err, data) => {
    // clean up shapes data from JSON,
    // add index to all sightings regardless of shape
    const { sightings } = data;
    const sightingsIndexed = util.getIndexedSightings(sightings, 0);
    const shapes = util.getShapesList(sightingsIndexed);
    // shape from param to be lower-cased, no spaces
    const shapeParam = util.standardizeParam(request.params.shape);
    if (shapes.indexOf(shapeParam) < 0) {
      response.status(404).send('Sorry, we cannot find that shape!');
    } else {
      // retrieve all matching shapes
      const matchingSightings = sightingsIndexed
        .filter((sighting) => shapeParam === util.standardizeParam(sighting.shape));

      const obj = {
        shape: matchingSightings[0].shape,
        sightings: matchingSightings,
      };
      response.render('shape', obj);
    }
  });
};

export const handleSighting = (request, response) => {
  filestorage.read(FILENAME, (err, data) => {
    // page indexes/ids start from 1 instead of 0
    if (request.params.index > data.sightings.length || request.params.index < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      // page indexes/ids start from 1 instead of 0
      const sighting = data.sightings[request.params.index - 1];
      // time formats
      const createdFmt = util.get2WeeksFromNowTimeFmt(sighting.created);
      const lastUpdatedFmt = util.get2WeeksFromNowTimeFmt(sighting.lastUpdated);

      const sightingFmt = {
        ...util.setSightingWithIndexObj(sighting, request.params.index),
        createdFmt,
        lastUpdatedFmt,
        dateTimeFmt: moment(sighting.date_time).format('dddd, MMMM Do, YYYY'),
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
  filestorage.read(FILENAME, (err, data) => {
    // page indexes/ids start from 1 instead of 0
    if (request.params.index > data.sightings.length || request.params.index < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      // page indexes/ids start from 1 instead of 0
      const sighting = data.sightings[request.params.index - 1];
      const sightingFmt = {
        ...util.setSightingWithIndexObj(sighting, request.params.index),
        timeNow: moment().format('YYYY-MM-DDTHH:mm'),
      };
      response.render('editsighting', { sighting: sightingFmt, type: 'edit' });
    }
  });
};

export const handleSightingEditPut = (request, response) => {
  const idxParam = request.params.index;
  if (Number.isNaN(Number(idxParam))) {
    response.status(406).send('Your sighting ID has to be a number!');
  }

  filestorage.read(FILENAME, (err, data) => {
    // page indexes/ids start from 1 instead of 0
    if (idxParam > data.sightings.length || idxParam < 1) {
      response.status(404).send('Sorry, we cannot find that!');
    } else {
      // input validation variables
      const sighting = request.body;
      const validatedSighting = validateSighting(sighting);
      const invalidRequests = util.getInvalidFormRequests(validatedSighting);
      // handle invalid requests
      if (invalidRequests.length > 0) {
        const sightingFmt = {
          ...util.setSightingWithIndexObj(validatedSighting, idxParam),
          timeNow: moment().format('YYYY-MM-DDTHH:mm'),
        };
        response.render('editsighting', { sighting: sightingFmt, type: 'edit' });
      } else {
        const createdTime = data.sightings[idxParam - 1].created;
        // page indexes/ids start from 1 instead of 0
        data.sightings[idxParam - 1] = util.getSightingToUpdate(sighting, createdTime);
        filestorage.write(FILENAME, data, (error) => {
          if (error) {
            response.status(500).send('DB write error. We cannot edit this sighting. Please try again!');
          }
          response.redirect(`/sighting/${idxParam}`);
        });
      }
    }
  });
};

export const handleSightingDelete = (request, response) => {
  const idxParam = request.params.index;
  if (Number.isNaN(Number(idxParam))) {
    response.status(406).send('Your sighting ID has to be a number!');
  } else {
    // page indexes/ids start from 1 instead of 0
    filestorage.remove(FILENAME, 'sightings', idxParam - 1, (err) => {
      if (err === 'Index does not exist') {
        response.status(404).send('Sorry, we cannot find that!');
      } else if (err === 'DB write error') {
        response.status(500).send('DB write error. We cannot delete this sighting. Please try again!');
      } else if (!err) {
        response.redirect('/');
      }
    });
  }
};

export const handleSightingCreate = (request, response) => {
  // input validation variables
  const sighting = request.body;
  const validatedSighting = validateSighting(sighting);
  const invalidRequests = util.getInvalidFormRequests(validatedSighting);
  // handle invalid requests
  if (invalidRequests.length > 0) {
    const validationObj = {
      ...validatedSighting,
      timeNow: moment().format('YYYY-MM-DDTHH:mm'),
    };
    response.render('editsighting', {
      sighting: validationObj,
      type: 'new',
    });
  } else {
    // no created time argument passed in, so it defaults to creating a new one
    const sightingFmt = util.getSightingToUpdate(sighting);
    // Add new recipe data in request.body to recipes array in data.json.
    filestorage.add(FILENAME, 'sightings', sightingFmt, (err, str) => {
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
