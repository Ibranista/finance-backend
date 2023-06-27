/**
 * Expose
 */

module.exports = {
  db: encodeURI(
    process.env.MONGODB_URL || 'mongodb://localhost:27017/zad_updated_prod'
  )
};
