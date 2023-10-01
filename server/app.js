const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Ajoutez le middleware CORS ici
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

module.exports.handler = serverless(app);