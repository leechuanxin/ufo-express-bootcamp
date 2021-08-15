const standardizeParam = (str) => str
  .trim()
  .toLowerCase()
  .replace('%20', ' ')
  .replace(' ', '-')
  .replace('_', '-')
  .replace('-', '');

export default standardizeParam;
