const mongoose = require('mongoose');
const config = require('config');

const uri = config.get('database.mongo.uri');

function connectMongo() {
  return mongoose.connect(uri);
}

module.exports = { mongoose, connectMongo };