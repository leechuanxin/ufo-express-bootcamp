// replace all spaces, dashes and underscores
const standardizeParam = (str) => str
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

export default standardizeParam;
