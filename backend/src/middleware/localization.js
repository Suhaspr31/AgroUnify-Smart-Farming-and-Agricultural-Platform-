/**
 * Localization middleware (basic implementation)
 */
const localization = (req, res, next) => {
  // Get language from header, query, or default to 'en'
  const language = req.headers['accept-language']?.split(',')[0] || 
                   req.query.lang || 
                   'en';

  req.language = language;
  next();
};

module.exports = localization;
