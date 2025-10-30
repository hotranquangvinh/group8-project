const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: dhy1dfmbh,
  api_key: 797355771567734,
  api_secret: qCq_urTaukEWIf17YVsWuzDhzCg,
});

module.exports = cloudinary;
