import moment from 'moment';

const validateCity = (sighting) => {
  const obj = {};
  if (!sighting.city || sighting.city.trim() === '') {
    obj.city_invalid = 'Please enter a valid city name.';
  }
  return obj;
};

const validateState = (sighting) => {
  const obj = {};
  if (!sighting.state || sighting.state.trim === '') {
    obj.state_invalid = 'Please enter a valid state name.';
  }
  return obj;
};

const validateDateTime = (sighting) => {
  const currentTime = new Date();
  const dateTime = new Date(sighting.date_time);
  const obj = {};
  if (
    !(dateTime instanceof Date)
    || Number.isNaN(Number(dateTime.valueOf()))
    || dateTime > currentTime
  ) {
    obj.date_time_invalid = `Please enter a valid time before ${moment(currentTime).format('MMMM DD, YYYY, hh:mmA')}.`;
  }
  return obj;
};

const validateShape = (sighting) => {
  const obj = {};
  if (!sighting.shape || sighting.shape.trim === '') {
    obj.shape_invalid = 'Please enter a valid shape.';
  }
  return obj;
};

const validateDuration = (sighting) => {
  const obj = {};
  if (!sighting.duration || sighting.duration.trim === '') {
    obj.duration_invalid = 'Please enter a valid duration.';
  }
  return obj;
};

const validateText = (sighting) => {
  const obj = {};
  if (!sighting.text || sighting.text.trim === '') {
    obj.text_invalid = 'Please tell us more about this UFO sighting.';
  }
  return obj;
};

const validateSighting = (sighting) => {
  const validationObj = {
    ...sighting,
    ...validateCity(sighting),
    ...validateState(sighting),
    ...validateDateTime(sighting),
    ...validateShape(sighting),
    ...validateDuration(sighting),
    ...validateText(sighting),
  };

  return validationObj;
};

export default validateSighting;
