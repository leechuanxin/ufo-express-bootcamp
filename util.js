import moment from 'moment';

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

export const validateSighting = (sighting, res) => {
  const currentTime = new Date();
  const dateTimeValidated = new Date(sighting.date_time);
  if (!sighting.city || sighting.city.trim() === '') {
    res.status(400).send('Please enter a valid city of your UFO sighting!');
    return false;
  }

  if (!sighting.state || sighting.state.trim === '') {
    res.status(400).send('Please enter a valid state of your UFO sighting!');
    return false;
  }

  if (
    !(dateTimeValidated instanceof Date)
    || Number.isNaN(Number(dateTimeValidated.valueOf()))
    || dateTimeValidated > currentTime
  ) {
    res.status(400).send(`Please enter a valid date and time before ${moment(currentTime).format('MMMM DD, YYYY hh:mmA')} for your UFO sighting!`);
    return false;
  }

  if (!sighting.shape || sighting.shape.trim === '') {
    res.status(400).send('Please enter a valid shape of your UFO!');
    return false;
  }

  if (!sighting.duration || sighting.duration.trim === '') {
    res.status(400).send('Please enter a valid duration of your UFO sighting!');
    return false;
  }

  if (!sighting.text || sighting.text.trim === '') {
    res.status(400).send('Please tell us more about your UFO sighting!');
    return false;
  }

  return sighting;
};
