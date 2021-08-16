import moment from 'moment';

const SUMMARY_CHAR_LIMIT = 100;

// replace all spaces, dashes and underscores
export const standardizeParam = (str) => str
  .trim()
  .toLowerCase()
  .split('%20')
  .join('')
  .split(' ')
  .join('')
  .split('_')
  .join('')
  .split('-')
  .join('');

export const getShapesList = (sightings) => {
  const shapeTally = {};
  sightings.forEach((sighting) => {
    // shapes from data.json to be lower-cased, no spaces
    const shape = standardizeParam(sighting.shape);
    if (!shapeTally[shape]) {
      shapeTally[shape] = '';
    }
  });
  return Object.keys(shapeTally);
};

export const getUniqueShapesList = (sightings) => {
  const shapeTally = {};
  sightings.forEach((sighting) => {
    // get standardized str of shape from data.json
    const standardizedShape = standardizeParam(sighting.shape);
    // get list of unique shapes based on said standardisation
    const standardizedShapesArr = Object.keys(shapeTally).map((shape) => standardizeParam(shape));
    if (standardizedShapesArr.indexOf(standardizedShape) < 0) {
      shapeTally[sighting.shape] = '';
    }
  });
  return Object.keys(shapeTally);
};

export const getFromNowTimeFmt = (time) => {
  const momentTime = moment(time);
  const weekAgo = moment().subtract(7, 'days');
  if (momentTime.isAfter(weekAgo)) {
    return momentTime.fromNow();
  }
  return momentTime.format('MMMM DD, YYYY');
};

export const getInvalidFormRequests = (obj) => Object.keys(obj).filter((key) => key.indexOf('invalid') >= 0);

export const getTextSummary = (text) => text
  .substring(0, SUMMARY_CHAR_LIMIT)
  .concat(
    (text.length > SUMMARY_CHAR_LIMIT) ? '...' : '',
  );

export const getIndexedSightings = (sightings, indexIncrement) => sightings.map(
  (sighting, index) => ({ ...sighting, idx: index + indexIncrement }),
);
