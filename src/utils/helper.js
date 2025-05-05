const generateFullUrl = (req, filePath) => {
  if (!filePath) return null;
  const protocol = req?.protocol || 'http'; // Default to 'http' if undefined
  return `${protocol}://${req?.get('host')}/${filePath}`;
};
module.exports = { generateFullUrl };